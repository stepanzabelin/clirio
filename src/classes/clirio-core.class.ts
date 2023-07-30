import {
  ActionType,
  Args,
  ArgType,
  InputTypeEnum,
  LinkType,
  ParsedArg,
  Pipe,
  Filter,
  Module,
  DataTypeEnum,
  ClirioConfig,
} from '../types';
import {
  actionTargetMetadata,
  helperArgMetadata,
  moduleEntityMetadata,
  optionsArgMetadata,
  paramsArgMetadata,
} from '../metadata';
import { ClirioHelper } from './clirio-helper.class';
import { ClirioHandler } from './clirio-handler.class';
import { ClirioCommonError, ClirioDebugError } from '../exceptions';
import { Clirio } from './clirio.class';
import { getPrototype } from '../utils';

export class ClirioCore {
  protected modules: Module[] = [];
  protected config: ClirioConfig = {
    allowUncontrolledOptions: true,
  };
  protected handler = new ClirioHandler();
  protected globalPipe: Pipe | null = null;
  protected globalFilter: Filter | null = null;

  private *iterateData() {
    for (const module of this.modules) {
      const moduleData = moduleEntityMetadata.get(getPrototype(module))!;
      const actionMap = actionTargetMetadata.getMap(getPrototype(module));

      for (const [actionName, actionData] of actionMap) {
        yield { module, moduleData, actionName, actionData };
      }
    }
  }

  protected async execute(args?: Args): Promise<never | void> {
    const parsedArgs = ClirioCore.describe(args ?? Clirio.getProcessArgs());

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
      const linkedArgs = this.handler.linkArgs(parsedArgs, links);

      if (!linkedArgs) {
        continue;
      }

      try {
        const paramLinkedArgs = linkedArgs.filter(
          (linkedArg) => linkedArg.type === 'param',
        );

        const optionLinkedArgs = linkedArgs.filter(
          (linkedArg) => linkedArg.type === 'option',
        );

        const optionsArgMap = optionsArgMetadata.getArgMap(
          getPrototype(module),
          actionName,
        );

        const paramsArgMap = paramsArgMetadata.getArgMap(
          getPrototype(module),
          actionName,
        );

        const helperArgMap = helperArgMetadata.getArgMap(
          getPrototype(module),
          actionName,
        );

        const combinedArguments = [
          ...paramsArgMap,
          ...optionsArgMap,
          ...helperArgMap,
        ].sort((a, b) => a[0] - b[0]);

        if (
          !this.config.allowUncontrolledOptions &&
          optionsArgMap.size === 0 &&
          optionLinkedArgs.length > 0
        ) {
          throw new ClirioCommonError('Invalid options received', {
            errCode: 'INVALID_OPTIONS',
          });
        }

        const pipeScopeList = this.handler.collectPipes(
          this.globalPipe,
          module,
          actionName,
        );

        const maxIndex = combinedArguments.reduce((max, [argumentIndex]) => {
          return argumentIndex > max ? argumentIndex : max;
        }, 0);

        const transformedArguments: any[] = Array.from(
          { length: maxIndex + 0 },
          () => null,
        );

        for (const [argumentIndex, input] of combinedArguments) {
          switch (input.type) {
            case InputTypeEnum.Params:
              {
                const handledParamRows = this.handler.handleParams(
                  paramLinkedArgs,
                  input.entity,
                  DataTypeEnum.Params,
                );

                const pipedParams = this.handler.passPipes(
                  handledParamRows,
                  input.entity,
                  DataTypeEnum.Params,
                  pipeScopeList,
                );

                transformedArguments[argumentIndex] = pipedParams;
              }

              break;
            case InputTypeEnum.Options:
              {
                const handledOptionRows = this.handler.handleOptions(
                  optionLinkedArgs,
                  input.entity,
                  DataTypeEnum.Options,
                );

                const pipedOptions = this.handler.passPipes(
                  handledOptionRows,
                  input.entity,
                  DataTypeEnum.Options,
                  pipeScopeList,
                );

                transformedArguments[argumentIndex] = pipedOptions;
              }
              break;

            case InputTypeEnum.Helper:
              {
                transformedArguments[argumentIndex] = new ClirioHelper({
                  scopedModuleEntity: getPrototype(module).constructor,
                  scopedActionName: actionName,
                  modules: this.modules,
                });
              }
              break;
            default:
              continue;
          }
        }

        await this.handler.applyAction(
          module,
          actionName,
          transformedArguments,
        );
        return;
      } catch (err: any) {
        const filterScopeList = this.handler.collectFilters(
          this.globalFilter,
          module,
          actionName,
        );
        this.handler.handleFilters(err, filterScopeList);
        return;
      }
    }

    // EMPTY ACTION

    const empties = [];

    for (const {
      module,
      moduleData,
      actionName,
      actionData,
    } of this.iterateData()) {
      if (actionData.type !== ActionType.Empty) {
        continue;
      }

      const data = this.handler.matchRoute(parsedArgs, moduleData.links);

      if (data) {
        empties.push({
          length: moduleData.links.length,
          module,
          actionName,
        });
      }
    }

    if (empties.length > 0) {
      const { module, actionName } = empties.sort(
        (a, b) => b.length - a.length,
      )[0]!;

      try {
        await this.handler.applyAction(module, actionName, []);
        return;
      } catch (err: any) {
        const filterScopeList = this.handler.collectFilters(
          this.globalFilter,
          module,
          actionName,
        );
        this.handler.handleFilters(err, filterScopeList);
        return;
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

      const length = moduleData.links.length;

      const data = this.handler.matchRoute(
        parsedArgs.slice(0, length),
        moduleData.links,
      );

      if (data) {
        failures.push({
          length,
          module,
          actionName,
        });
      }
    }

    if (failures.length > 0) {
      const { module, actionName } = failures.sort(
        (a, b) => b.length - a.length,
      )[0]!;

      try {
        await this.handler.applyAction(module, actionName, []);
        return;
      } catch (err: any) {
        const filterScopeList = this.handler.collectFilters(
          this.globalFilter,
          module,
          actionName,
        );
        this.handler.handleFilters(err, filterScopeList);
        return;
      }
    }

    const filterScopeList = this.handler.collectFilters(this.globalFilter);

    this.handler.handleFilters(
      new ClirioCommonError('Incorrect command specified', {
        errCode: 'INCORRECT_COMMAND',
      }),
      filterScopeList,
    );

    return;
  }

  public debug() {
    if (this.modules.length === 0) {
      throw new ClirioDebugError('There is no set module');
    }

    for (const module of this.modules) {
      if (!moduleEntityMetadata.has(getPrototype(module))) {
        throw new ClirioDebugError(
          'A constructor is not specified as a module. use @Module() decorator',
          {
            moduleName: module.name,
          },
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
          [LinkType.List, LinkType.Param].includes(link.type),
        ) > -1;

      const paramsArgMap = paramsArgMetadata.getArgMap(
        getPrototype(module),
        actionName,
      );

      const isInputParams = paramsArgMap.size > 0;

      if (isActionMask && !isInputParams) {
        throw new ClirioDebugError(`Value @Params is not bound to command`, {
          moduleName: module.name,
          actionName,
        });
      }

      if (!isActionMask && isInputParams) {
        throw new ClirioDebugError(
          `Either the pattern is missing from the command, or @Params argument is redundant`,
          {
            moduleName: module.name,
            actionName,
          },
        );
      }
    }
  }

  public static split = (query: string): string[] => {
    return query
      .trim()
      .split(/\s+(?=(?:[^"]*"[^"]*")*[^"]*$)/g)
      .map((element) =>
        element
          .replace(/^"([^"]*?)"$/, '$1')
          .replace(/(=|\s)"([^"]*?)"$/, '$1$2'),
      )
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
        /^(--(?<optionKey>[^=]+)|(?<emptyKey>-{1,2})|-(?<optionKeys>[^=]+))(=(?<value>[\s\S]*))?$/,
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
          const letters = optionKeys
            .slice(0, -1)
            .split('')
            .filter((letter) => letter !== '-');

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
