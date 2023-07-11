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
  Row,
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
import { ClirioHandler } from './ClirioHandler';
import { ClirioError } from '../exceptions';
import { DataTypeEnum } from '../types/DataTypeEnum';
import { ClirioDefaultException } from './ClirioDefaultException';
import { Clirio } from './Clirio';
import { ClirioDebugError } from '../exceptions/ClirioDebugError';

export class ClirioCore {
  protected args?: Args;
  protected modules: Module[] = [];
  protected config: ClirioConfig = clirioConfig;
  protected handler = new ClirioHandler();
  protected globalPipe: Pipe | null = null;
  protected globalException: Exception | null = null;
  protected globalResult: Result | null = null;

  private *iterateData() {
    for (const module of this.modules) {
      const moduleData = moduleEntityMetadata.get(
        this.handler.getPrototype(module)
      )!;
      const actionMap = actionTargetMetadata.getMap(
        this.handler.getPrototype(module)
      );

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
        const linkedArgs = this.handler.linkArgs(parsedArgs, links);

        if (!linkedArgs) {
          continue;
        }

        const paramLinkedArgs = linkedArgs.filter(
          (linkedArg) => linkedArg.type === 'param'
        );
        const optionLinkedArgs = linkedArgs.filter(
          (linkedArg) => linkedArg.type === 'option'
        );

        const optionsArgMap = optionsArgMetadata.getArgMap(
          this.handler.getPrototype(module),
          actionName
        );

        const paramsArgMap = paramsArgMetadata.getArgMap(
          this.handler.getPrototype(module),
          actionName
        );

        const helperArgMap = helperArgMetadata.getArgMap(
          this.handler.getPrototype(module),
          actionName
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
          actionName
        );

        const maxIndex = combinedArguments.reduce((max, [argumentIndex]) => {
          return argumentIndex > max ? argumentIndex : max;
        }, 0);

        const transformedArguments: any[] = Array.from(
          { length: maxIndex + 0 },
          () => null
        );

        for (const [argumentIndex, input] of combinedArguments) {
          switch (input.type) {
            case InputTypeEnum.Params:
              {
                const transformedParams = this.handler.handleParams(
                  paramLinkedArgs,
                  input.dto
                );

                const pipedParams = this.handler.passPipes(
                  transformedParams,
                  input.dto,
                  DataTypeEnum.Params,
                  pipeScopeList
                );

                transformedArguments[argumentIndex] = pipedParams;
              }

              break;
            case InputTypeEnum.Options:
              {
                const transformedOptions = this.handler.handleOptions(
                  optionLinkedArgs,
                  input.dto
                );

                const pipedOptions = this.handler.passPipes(
                  transformedOptions,
                  input.dto,
                  DataTypeEnum.Options,
                  pipeScopeList
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
          transformedArguments
        );
        return null;
      } catch (err: any) {
        const exceptionScopeList = this.handler.collectExceptions(
          this.globalException,
          module,
          actionName
        );
        this.handler.handleExceptions(err, exceptionScopeList);
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

        const data = this.handler.matchRoute(parsedArgs, moduleData.links);

        if (!data) {
          continue;
        }

        await this.handler.applyAction(module, actionName, []);
      } catch (err: any) {
        const exceptionScopeList = this.handler.collectExceptions(
          this.globalException,
          module,
          actionName
        );
        this.handler.handleExceptions(err, exceptionScopeList);
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

      const count = this.handler.countMatchRoute(parsedArgs, moduleData.links);

      failures.push({ count, module, actionName });
    }

    if (failures.length > 0) {
      const { module, actionName } = failures.sort(
        (a, b) => b.count - a.count
      )[0]!;
      try {
        await this.handler.applyAction(module, actionName, []);
        return null;
      } catch (err: any) {
        const exceptionScopeList = this.handler.collectExceptions(
          this.globalException,
          module,
          actionName
        );
        this.handler.handleExceptions(err, exceptionScopeList);
        return null;
      }
    }

    const exceptionScopeList = this.handler.collectExceptions(
      this.globalException
    );

    this.handler.handleExceptions(
      new ClirioError('Incorrect command specified', {
        errCode: 'INCORRECT_COMMAND',
      }),
      exceptionScopeList
    );

    return null;
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
          [LinkType.List, LinkType.Param].includes(link.type)
        ) > -1;

      const paramsArgMap = paramsArgMetadata.getArgMap(
        this.handler.getPrototype(module),
        actionName
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
          }
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
