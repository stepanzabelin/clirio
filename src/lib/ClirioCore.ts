import {
  ActionType,
  Args,
  ArgType,
  Constructor,
  InputTypeEnum,
  Link,
  LinkType,
  ParsedArg,
  RawOptions,
  RawParams,
} from '../types';
import { getProcessArgs } from './getProcessArgs';
import { ClirioConfig, clirioConfig } from './clirioConfig';
import { md } from '../metadata';
import { ClirioHelper } from './ClirioHelper';
import { ClirioValidator } from './ClirioValidator';
import {
  ClirioComplete,
  ClirioDebug,
  ClirioError,
  ClirioSuccess,
  ClirioWarning,
} from '../exceptions';

export class ClirioCore {
  protected args?: Args;
  protected modules: Constructor[] = [];
  protected config: ClirioConfig = clirioConfig;
  protected validator = new ClirioValidator();
  protected debugCallback?: (err: ClirioDebug) => void;
  protected errorCallback?: (err: ClirioError) => void;
  protected warningCallback?: (data: ClirioWarning) => void;
  protected completeCallback?: (data: ClirioComplete) => void;
  protected successCallback?: (data: ClirioSuccess) => void;

  private *iterateData() {
    for (const module of this.modules) {
      const moduleData = md.module.get(module.prototype)!;
      const actionMap = md.action.get(module.prototype);

      for (const [actionName, actionData] of actionMap) {
        yield { module, moduleData, actionName, actionData };
      }
    }
  }

  protected async execute(): Promise<never> {
    const parsedArgs = ClirioCore.parse(this.args ?? getProcessArgs());

    // COMMAND ACTION

    for (const {
      module,
      moduleData,
      actionName,
      actionData,
    } of this.iterateData()) {
      if (actionData.type !== ActionType.Command) {
        continue;
      }

      const links = [...moduleData.links, ...actionData.links];
      const data = this.matchRoute(parsedArgs, links);

      if (!data) {
        continue;
      }

      const inputArguments = Array.from(
        md.input.get(module.prototype, actionName)
      );

      if (
        this.config.validateOptionsWithoutDto &&
        inputArguments.findIndex(
          ([, params]) => params.type === InputTypeEnum.Options
        ) === -1 &&
        Object.keys(data.options).length > 0
      ) {
        this.validator.validateOptions(data.options, class {});
      }

      const transformedArguments = inputArguments.reverse().map(([, input]) => {
        switch (input.type) {
          case InputTypeEnum.Params:
            return this.validator.validateParams(data.params, input.dto);
          case InputTypeEnum.Options:
            return this.validator.validateOptions(data.options, input.dto, {
              nullableOptionValue: this.config.nullableOptionValue,
            });
          case InputTypeEnum.Helper:
            return new ClirioHelper({
              scoped: { module, actionName },
              modules: this.modules,
            });
          default:
            return undefined;
        }
      });

      await Reflect.apply(
        module.prototype[actionName],
        new module(),
        transformedArguments
      );

      throw new ClirioComplete();
    }

    // EMPTY ACTION

    for (const {
      module,
      moduleData,
      actionName,
      actionData,
    } of this.iterateData()) {
      if (actionData.type !== ActionType.Empty) {
        continue;
      }

      const data = this.matchRoute(parsedArgs, moduleData.links);

      if (!data) {
        continue;
      }

      await Reflect.apply(module.prototype[actionName], new module(), []);

      throw new ClirioComplete();
    }

    // FAILURE ACTION

    const failures = [];

    for (const {
      module,
      moduleData,
      actionName,
      actionData,
    } of this.iterateData()) {
      if (actionData.type !== ActionType.Failure) {
        continue;
      }

      const count = this.countMatchRoute(parsedArgs, moduleData.links);

      failures.push({ count, module, actionName });
    }

    if (failures.length > 0) {
      const { module, actionName } = failures.sort(
        (a, b) => b.count - a.count
      )[0]!;

      await Reflect.apply(module.prototype[actionName], new module(), []);

      throw new ClirioComplete();
    }

    // ERROR

    throw new ClirioError('Incorrect command specified');
  }

  public debug() {
    if (this.modules.length === 0) {
      throw new ClirioDebug('There is no set module');
    }

    for (const module of this.modules) {
      if (!md.module.has(module.prototype)) {
        throw new ClirioDebug(
          'A constructor is not specified as a module. use @Module() decorator',
          {
            entity: module.name,
          }
        );
      }
    }

    for (const {
      module,
      moduleData,
      actionName,
      actionData,
    } of this.iterateData()) {
      const links = [...moduleData.links, ...actionData.links];

      const isActionMask =
        links.findIndex((link) =>
          [LinkType.RestMask, LinkType.Mask].includes(link.type)
        ) > -1;

      const inputArguments = Array.from(
        md.input.get(module.prototype, actionName)
      );

      const isInputParams =
        inputArguments.findIndex(
          ([, params]) => params.type === InputTypeEnum.Params
        ) > -1;

      if (isActionMask && !isInputParams) {
        throw new ClirioDebug(`Argument @Params is not bound to command`, {
          entity: module.name,
          property: actionName,
        });
      }

      if (!isActionMask && isInputParams) {
        throw new ClirioDebug(
          `Either the pattern is missing from the command, or @Params argument is redundant`,
          {
            entity: module.name,
            property: actionName,
          }
        );
      }
    }
  }

  private matchRoute(
    parsedArgs: ParsedArg[],
    links: Link[]
  ): null | {
    params: RawParams;
    options: RawOptions;
  } {
    const params: RawParams = {};

    let actionIndex = 0;

    for (const link of links) {
      if (!parsedArgs.hasOwnProperty(actionIndex)) {
        return null;
      }

      const attributes = parsedArgs[actionIndex];

      switch (true) {
        case this.compareOption(link, attributes):
          break;
        case this.compareAction(link, attributes):
          break;
        case this.compareMask(link, attributes):
          {
            const [paramName] = link.values;
            params[paramName] = attributes.value!;
          }
          break;
        case this.compareRestMask(link, attributes):
          {
            const values: string[] = [];

            for (let index = actionIndex; index < parsedArgs.length; index++) {
              const parsedArg = parsedArgs[index];
              if (parsedArg.type === ArgType.Action) {
                values.push(parsedArg.value!);
                actionIndex = index;
              } else {
                break;
              }
            }
            const [paramName] = link.values;
            params[paramName] = values;
          }

          break;
        default:
          return null;
      }

      actionIndex++;
    }

    const restParsedArgs = parsedArgs.slice(actionIndex);

    if (
      restParsedArgs.findIndex(
        (attributes) => attributes.type === ArgType.Action
      ) > -1
    ) {
      return null;
    }

    const parsedOptions = restParsedArgs.filter(
      (attributes) => attributes.type === ArgType.Option
    );

    const options: RawOptions = {};

    for (let index = 0; index < parsedOptions.length; index++) {
      const attributes = parsedOptions[index];

      if (options.hasOwnProperty(attributes.key)) {
        if (Array.isArray(options[attributes.key])) {
          options[attributes.key].push(attributes.value);
        } else {
          options[attributes.key] = [options[attributes.key], attributes.value];
        }
      } else {
        options[attributes.key] = attributes.value;
      }
    }

    return { params, options };
  }

  private countMatchRoute(parsedArgs: ParsedArg[], links: Link[]): number {
    let counter = 0;

    let actionIndex = 0;

    for (const link of links) {
      if (!parsedArgs.hasOwnProperty(actionIndex)) {
        return counter;
      }

      const attributes = parsedArgs[actionIndex];

      switch (true) {
        case this.compareOption(link, attributes):
          break;
        case this.compareAction(link, attributes):
          break;
        case this.compareMask(link, attributes):
          break;
        case this.compareRestMask(link, attributes):
          for (let index = actionIndex; index < parsedArgs.length; index++) {
            const parsedArg = parsedArgs[index];
            if (parsedArg.type === ArgType.Action) {
              actionIndex = index;
            } else {
              break;
            }
          }
          break;
        default:
          return counter;
      }

      actionIndex++;
      counter++;
    }

    return counter;
  }

  private compareOption(link: Link, attributes: ParsedArg): boolean {
    return (
      link.type === LinkType.Option &&
      attributes.type === ArgType.Option &&
      link.values.includes(attributes.key) &&
      attributes.value === null
    );
  }

  private compareAction(link: Link, attributes: ParsedArg): boolean {
    return (
      link.type === LinkType.Action &&
      attributes.type === ArgType.Action &&
      link.values.includes(attributes.value!)
    );
  }

  private compareMask(link: Link, attributes: ParsedArg): boolean {
    return link.type === LinkType.Mask && attributes.type === ArgType.Action;
  }

  private compareRestMask(link: Link, attributes: ParsedArg): boolean {
    return (
      link.type === LinkType.RestMask && attributes.type === ArgType.Action
    );
  }

  public static parse = (args: Args): ParsedArg[] => {
    const rows: ParsedArg[] = [];

    let nextData: Omit<ParsedArg, 'value'> | null = null;
    let actionCount = 0;

    for (const arg of args) {
      const match = arg.match(
        /^(--(?<optionKey>[^=]+)|(?<emptyKey>-{1,2})|-(?<optionKeys>[^=]+))(=(?<value>[\s\S]*))?$/
      );

      if (nextData) {
        if (match) {
          rows.push({
            ...nextData,
            value: null,
          });
          nextData = null;
        } else {
          rows.push({
            ...nextData,
            value: arg,
          });
          nextData = null;
          continue;
        }
      }

      if (match) {
        const { optionKey, emptyKey, optionKeys, value } = match.groups!;

        let data: Omit<ParsedArg, 'value'>;

        if (emptyKey) {
          rows.push({
            type: ArgType.Option,
            key: emptyKey,
            value: null,
          });
          continue;
        } else if (optionKey) {
          data = {
            type: ArgType.Option,
            key: optionKey,
          };
        } else {
          const letters = optionKeys.slice(0, -1).split('');

          for (const letter of letters) {
            rows.push({
              type: ArgType.Option,
              key: letter,
              value: null,
            });
          }

          data = {
            type: ArgType.Option,
            key: optionKeys.slice(-1)[0],
          };
        }

        if (value !== undefined) {
          rows.push({
            ...data,
            value,
          });
        } else {
          nextData = data;
        }
      } else {
        rows.push({
          type: ArgType.Action,
          key: actionCount.toString(),
          value: arg,
        });

        actionCount++;
      }
    }

    if (nextData) {
      rows.push({
        ...nextData,
        value: null,
      });
    }

    return rows;
  };

  protected callDebug(err: ClirioDebug) {
    if (this.debugCallback) {
      this.debugCallback(err);
    } else {
      console.log('\x1b[31m%s\x1b[0m', err.format());
      process.exit(5);
    }
  }

  protected callError(err: ClirioError) {
    if (this.errorCallback) {
      this.errorCallback(err);
    } else {
      console.log('\x1b[31m%s\x1b[0m', err.message);
      process.exit(9);
    }
  }

  protected callWarning(data: ClirioWarning) {
    if (this.warningCallback) {
      this.warningCallback(data);
    } else {
      console.log('\x1b[33m%s\x1b[0m', data.message);
      process.exit(0);
    }
  }

  protected callComplete(data: ClirioComplete) {
    if (this.completeCallback) {
      this.completeCallback(data);
    } else {
      console.log('\x1b[34m%s\x1b[0m', data.message);
      process.exit(0);
    }
  }

  protected callSuccess(data: ClirioSuccess) {
    if (this.successCallback) {
      this.successCallback(data);
    } else {
      if (data) {
        console.log('\x1b[32m%s\x1b[0m', data.message);
      }
      process.exit(0);
    }
  }
}
