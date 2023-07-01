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
  ClirioPipe,
  Pipe,
  PipeScope,
  ExceptionScope,
  Exception,
  ClirioException,
  Result,
  Module,
  LinkedArg,
} from '../types';
import { getProcessArgs } from './getProcessArgs';
import { ClirioConfig, clirioConfig } from './clirioConfig';
import {
  actionTargetMetadata,
  exceptionTargetMetadata,
  helperArgMetadata,
  moduleEntityMetadata,
  optionsArgMetadata,
  paramsArgMetadata,
  pipeTargetMetadata,
} from '../metadata';
import { ClirioHelper } from './ClirioHelper';
import { ClirioValidator } from './ClirioValidator';
import { ClirioRouteError, ClirioValidationError } from '../exceptions';
import { DataTypeEnum } from '../types/DataTypeEnum';
import { ClirioDefaultException } from './ClirioDefaultException';
import { Clirio } from './Clirio';

export class ClirioCore {
  protected args?: Args;
  protected modules: Module[] = [];
  protected config: ClirioConfig = clirioConfig;
  protected validator = new ClirioValidator();
  protected globalPipe: Pipe | null = null;
  protected globalException: Exception | null = null;
  protected globalResult: Result | null = null;

  private getPrototype(
    entity: Constructor<any> | Constructor<any>['prototype']
  ) {
    return typeof entity === 'function'
      ? entity.prototype
      : entity.constructor.prototype;
  }

  private getInstance(
    entity: Constructor<any> | Constructor<any>['prototype']
  ) {
    return typeof entity === 'function' ? new entity() : entity;
  }

  private *iterateData() {
    for (const module of this.modules) {
      const moduleData = moduleEntityMetadata.get(this.getPrototype(module))!;
      const actionMap = actionTargetMetadata.getMap(this.getPrototype(module));

      for (const [actionName, actionData] of actionMap) {
        yield { module, moduleData, actionName, actionData };
      }
    }
  }

  protected async execute(): Promise<never | null> {
    const parsedArgs = ClirioCore.describe(this.args ?? getProcessArgs());

    // COMMAND ACTION

    for (const {
      module,
      moduleData,
      actionName,
      actionData,
    } of this.iterateData()) {
      try {
        if (actionData.type !== ActionType.Command) {
          continue;
        }

        const links = [...moduleData.links, ...actionData.links];
        const data = this.matchRoute(parsedArgs, links);
        const linkedArgs = this.linkArgs(parsedArgs, links);

        console.log(linkedArgs);

        if (!data) {
          continue;
        }

        const optionsArgMap = optionsArgMetadata.getArgMap(
          this.getPrototype(module),
          actionName
        );

        if (
          !this.config.allowUncontrolledOptions &&
          optionsArgMap.size === 0 &&
          Object.keys(data.options).length > 0
        ) {
          throw new ClirioValidationError('Invalid options received', {
            propertyName: null,
            dataType: DataTypeEnum.Options,
          });
        }

        const paramsArgMap = paramsArgMetadata.getArgMap(
          this.getPrototype(module),
          actionName
        );

        const helperArgMap = helperArgMetadata.getArgMap(
          this.getPrototype(module),
          actionName
        );

        const combinedArguments = [
          ...paramsArgMap,
          ...optionsArgMap,
          ...helperArgMap,
        ].sort((a, b) => a[0] - b[0]);

        const pipeScopeList = this.collectPipes(module, actionName);

        const transformedArguments = [];

        for (const [, input] of combinedArguments) {
          switch (input.type) {
            case InputTypeEnum.Params:
              {
                const transformedParams = this.validator.validateParams(
                  data.params,
                  input.dto
                );

                const pipedParams = this.handlePipes(
                  transformedParams,
                  input.dto,
                  DataTypeEnum.Params,
                  pipeScopeList
                );

                transformedArguments.push(pipedParams);
              }

              break;
            case InputTypeEnum.Options:
              {
                const transformedOptions = this.validator.validateOptions(
                  data.options,
                  input.dto
                );

                const pipedOptions = this.handlePipes(
                  transformedOptions,
                  input.dto,
                  DataTypeEnum.Options,
                  pipeScopeList
                );

                transformedArguments.push(pipedOptions);
              }
              break;

            case InputTypeEnum.Helper:
              transformedArguments.push(
                new ClirioHelper({
                  scoped: { module, actionName },
                  modules: this.modules,
                })
              );
              break;
            default:
              continue;
          }
        }

        await this.applyAction(module, actionName, transformedArguments);
        return null;
      } catch (err: any) {
        const exceptionScopeList = this.collectExceptions(module, actionName);
        this.handleExceptions(err, exceptionScopeList);
        return null;
      }
    }

    // EMPTY ACTION

    for (const {
      module,
      moduleData,
      actionName,
      actionData,
    } of this.iterateData()) {
      try {
        if (actionData.type !== ActionType.Empty) {
          continue;
        }

        const data = this.matchRoute(parsedArgs, moduleData.links);

        if (!data) {
          continue;
        }

        await this.applyAction(module, actionName, []);
      } catch (err: any) {
        const exceptionScopeList = this.collectExceptions(module, actionName);
        this.handleExceptions(err, exceptionScopeList);
        return null;
      }
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
      try {
        await this.applyAction(module, actionName, []);
        return null;
      } catch (err: any) {
        const exceptionScopeList = this.collectExceptions(module, actionName);
        this.handleExceptions(err, exceptionScopeList);
        return null;
      }
    }

    const exceptionScopeList = this.collectExceptions();

    this.handleExceptions(
      new ClirioRouteError('Incorrect command specified'),
      exceptionScopeList
    );

    return null;
  }

  async applyAction(
    module: Constructor<any>,
    actionName: string,
    transformedArguments: any[]
  ) {
    await Reflect.apply(
      this.getPrototype(module)[actionName],
      this.getInstance(module),
      transformedArguments
    );
  }

  public debug() {
    if (this.modules.length === 0) {
      throw Clirio.debug('There is no set module');
    }

    for (const module of this.modules) {
      if (!moduleEntityMetadata.has(this.getPrototype(module))) {
        throw Clirio.debug(
          'A constructor is not specified as a module. use @Module() decorator',
          {
            moduleName: module.name,
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
          [LinkType.List, LinkType.Value].includes(link.type)
        ) > -1;

      const paramsArgMap = paramsArgMetadata.getArgMap(
        this.getPrototype(module),
        actionName
      );

      const isInputParams = paramsArgMap.size > 0;

      if (isActionMask && !isInputParams) {
        throw Clirio.debug(`Value @Params is not bound to command`, {
          moduleName: module.name,
          actionName,
        });
      }

      if (!isActionMask && isInputParams) {
        throw Clirio.debug(
          `Either the pattern is missing from the command, or @Params argument is redundant`,
          {
            moduleName: module.name,
            actionName,
          }
        );
      }
    }
  }

  public handlePipes(
    rawData: any,
    dto: Constructor,
    dataType: DataTypeEnum,
    pipeList: PipeScope[] = []
  ) {
    let data = { ...rawData };

    for (const { pipe, scope } of pipeList) {
      const pipeInst: ClirioPipe =
        typeof pipe === 'function' ? new pipe() : pipe;

      data = pipeInst.transform(data, {
        dataType,
        scope,
        dto,
      });
    }

    return data;
  }

  public handleExceptions(
    rawErr: any,
    exceptionList: ExceptionScope[] = [],
    {
      dto = null,
      dataType = null,
    }: {
      dto?: Constructor | null;
      dataType?: DataTypeEnum | null;
    } = {}
  ) {
    let currentErr = rawErr;

    for (const { exception, scope } of exceptionList) {
      const exceptionInst: ClirioException =
        typeof exception === 'function' ? new exception() : exception;

      try {
        exceptionInst.catch(currentErr, {
          dataType,
          scope,
          dto,
        });
      } catch (err) {
        currentErr = err;
      }
    }

    new ClirioDefaultException().catch(currentErr, {
      dataType,
      scope: 'default',
      dto,
    });
  }

  collectPipes(module: Constructor<any>, actionName: string): PipeScope[] {
    let pipeScopeList: PipeScope[] = [];

    const pipeMetadata = pipeTargetMetadata.getData(
      this.getPrototype(module),
      actionName
    );

    if (this.globalPipe) {
      pipeScopeList.push({ scope: 'global', pipe: this.globalPipe });
    }

    if (pipeMetadata) {
      pipeScopeList.push({ scope: 'command', pipe: pipeMetadata.pipe });

      if (pipeMetadata.overwriteGlobal) {
        pipeScopeList = pipeScopeList.filter((item) => item.scope !== 'global');
      }
    }

    return pipeScopeList;
  }

  collectExceptions(
    module?: Constructor<any>,
    actionName?: string
  ): ExceptionScope[] {
    let exceptionScopeList: ExceptionScope[] = [];

    if (this.globalException) {
      exceptionScopeList.push({
        scope: 'global',
        exception: this.globalException,
      });
    }

    if (module && actionName) {
      const exceptionMetadata = exceptionTargetMetadata.getData(
        this.getPrototype(module),
        actionName
      );

      if (exceptionMetadata) {
        exceptionScopeList.push({
          scope: 'command',
          exception: exceptionMetadata.exception,
        });

        if (exceptionMetadata.overwriteGlobal) {
          exceptionScopeList = exceptionScopeList.filter(
            (item) => item.scope !== 'global'
          );
        }
      }
    }

    return exceptionScopeList;
  }

  private linkArgs(parsedArgs: ParsedArg[], links: Link[]): null | LinkedArg[] {
    const linkedArgs: LinkedArg[] = [];

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

            linkedArgs.push({
              type: 'param',
              key: paramName,
              allowedKeys: [],
              property: null,
              value: attributes.value,
              transformed: false,
            });
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

            linkedArgs.push({
              type: 'param',
              key: paramName,
              allowedKeys: [],
              value: values,
              property: null,
              transformed: false,
            });
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

    for (let index = 0; index < parsedOptions.length; index++) {
      const attributes = parsedOptions[index];

      linkedArgs.push({
        type: 'option',
        key: attributes.key,
        allowedKeys: [],
        value: attributes.value,
        property: null,
        transformed: false,
      });
    }

    // const optionMap = new Map<string, any>();

    // for (let index = 0; index < parsedOptions.length; index++) {
    //   const attributes = parsedOptions[index];

    //   const values = optionMap.get(attributes.key) ?? [];
    //   values.push(attributes.value);
    //   optionMap.set(attributes.key, values);
    // }

    // linkedArgs.concat(
    //   [...optionMap].map(([key, values]) => ({
    //     type: 'option',
    //     key,
    //     value: values.length > 1 ? values : ,
    //     property: null,
    //     transformed: false,
    //   }))
    // );

    return linkedArgs;
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
    return link.type === LinkType.Value && attributes.type === ArgType.Action;
  }

  private compareRestMask(link: Link, attributes: ParsedArg): boolean {
    return link.type === LinkType.List && attributes.type === ArgType.Action;
  }

  public static split = (query: string): string[] => {
    return query
      .trim()
      .split(/\s+(?=(?:[^"]*"[^"]*")*[^"]*$)/g)
      .filter((f) => f);
  };

  public static parse = (query: string): ParsedArg[] => {
    return Clirio.describe(Clirio.split(query));
  };

  public static describe = (args: Args): ParsedArg[] => {
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
}
