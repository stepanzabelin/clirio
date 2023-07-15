import {
  ActionType,
  Args,
  ArgType,
  InputTypeEnum,
  LinkType,
  ParsedArg,
  Pipe,
  Exception,
  Result,
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
import { ClirioError, ClirioDebugError } from '../exceptions';
import { Clirio } from './clirio.class';

export class ClirioCore {
  protected modules: Module[] = [];
  protected config: ClirioConfig = {
    allowUncontrolledOptions: false,
  };
  protected handler = new ClirioHandler();
  protected globalPipe: Pipe | null = null;
  protected globalException: Exception | null = null;
  protected globalResult: Result | null = null;

  private *iterateData() {
    for (const module of this.modules) {
      const moduleData = moduleEntityMetadata.get(
        this.handler.getPrototype(module),
      )!;
      const actionMap = actionTargetMetadata.getMap(
        this.handler.getPrototype(module),
      );

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
          this.handler.getPrototype(module),
          actionName,
        );

        const paramsArgMap = paramsArgMetadata.getArgMap(
          this.handler.getPrototype(module),
          actionName,
        );

        const helperArgMap = helperArgMetadata.getArgMap(
          this.handler.getPrototype(module),
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
          throw new ClirioError('Invalid options received', {
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
                  input.dto,
                  DataTypeEnum.Params,
                );

                const pipedParams = this.handler.passPipes(
                  handledParamRows,
                  input.dto,
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
                  input.dto,
                  DataTypeEnum.Options,
                );

                const pipedOptions = this.handler.passPipes(
                  handledOptionRows,
                  input.dto,
                  DataTypeEnum.Options,
                  pipeScopeList,
                );

                transformedArguments[argumentIndex] = pipedOptions;
              }
              break;

            case InputTypeEnum.Helper:
              transformedArguments[argumentIndex] = new ClirioHelper({
                scoped: { module, actionName },
                modules: this.modules,
              });

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
      } catch (err: any) {
        const exceptionScopeList = this.handler.collectExceptions(
          this.globalException,
          module,
          actionName,
        );
        this.handler.handleExceptions(err, exceptionScopeList);
      } finally {
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
      } catch (err: any) {
        const exceptionScopeList = this.handler.collectExceptions(
          this.globalException,
          module,
          actionName,
        );
        this.handler.handleExceptions(err, exceptionScopeList);
      } finally {
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
      } catch (err: any) {
        const exceptionScopeList = this.handler.collectExceptions(
          this.globalException,
          module,
          actionName,
        );
        this.handler.handleExceptions(err, exceptionScopeList);
      } finally {
        return;
      }
    }

    const exceptionScopeList = this.handler.collectExceptions(
      this.globalException,
    );

    this.handler.handleExceptions(
      new ClirioError('Incorrect command specified', {
        errCode: 'INCORRECT_COMMAND',
      }),
      exceptionScopeList,
    );

    return;
  }

  public debug() {
    if (this.modules.length === 0) {
      throw new ClirioDebugError('There is no set module');
    }

    for (const module of this.modules) {
      if (!moduleEntityMetadata.has(this.handler.getPrototype(module))) {
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
        this.handler.getPrototype(module),
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
