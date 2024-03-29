import {
  Args,
  ArgType,
  InputTypeEnum,
  ArgPatternType,
  ParsedArg,
  Pipe,
  Filter,
  Module,
  DataTypeEnum,
  ClirioConfig,
  OptionArg,
} from '../types';
import {
  commandTargetMetadata,
  emptyTargetMetadata,
  failureTargetMetadata,
  helperArgMetadata,
  moduleEntityMetadata,
  optionsArgMetadata,
  paramsArgMetadata,
  envsArgMetadata,
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

  private *iterateModuleData() {
    for (const module of this.modules) {
      const moduleData = moduleEntityMetadata.get(getPrototype(module))!;
      yield { module, moduleData };
    }
  }

  private *iterateCommandData() {
    for (const { module, moduleData } of this.iterateModuleData()) {
      const commandMap = commandTargetMetadata.getMap(getPrototype(module));

      for (const [actionName, commandData] of commandMap) {
        yield { module, moduleData, actionName, commandData };
      }
    }
  }

  private *iterateEmptyData() {
    for (const { module, moduleData } of this.iterateModuleData()) {
      const emptyMap = emptyTargetMetadata.getMap(getPrototype(module));

      for (const [actionName, emptyData] of emptyMap) {
        yield { module, moduleData, actionName, emptyData };
      }
    }
  }

  private *iterateFailureData() {
    for (const { module, moduleData } of this.iterateModuleData()) {
      const failureMap = failureTargetMetadata.getMap(getPrototype(module));

      for (const [actionName, failureData] of failureMap) {
        yield { module, moduleData, actionName, failureData };
      }
    }
  }

  protected async execute(args?: Args): Promise<never | void> {
    const parsedArgs = ClirioCore.describe(args ?? Clirio.getProcessArgs());

    for (const {
      module,
      moduleData,
      actionName,
      commandData,
    } of this.iterateCommandData()) {
      const links = [...moduleData.links, ...commandData.links];

      const matched = this.handler.matchArgs(parsedArgs, links);

      if (!matched) {
        continue;
      }

      const { params, options } = matched;

      try {
        const paramsArgMap = paramsArgMetadata.getArgMap(
          getPrototype(module),
          actionName,
        );

        const optionsArgMap = optionsArgMetadata.getArgMap(
          getPrototype(module),
          actionName,
        );

        const envsArgMap = envsArgMetadata.getArgMap(
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
          ...envsArgMap,
          ...helperArgMap,
        ].sort((a, b) => a[0] - b[0]);

        if (
          !this.config.allowUncontrolledOptions &&
          optionsArgMap.size === 0 &&
          Object.keys(options).length > 0
        ) {
          throw new ClirioCommonError('Invalid options received', {
            code: 'INVALID_OPTIONS',
          });
        }

        const pipeScopeList = this.handler.collectPipes(
          this.globalPipe,
          module,
          actionName,
        );

        const transformedArguments: any[] = [];

        for (const [, input] of combinedArguments) {
          switch (input.type) {
            case InputTypeEnum.envs:
              {
                const pipedEnvs = await this.handler.passPipes(
                  this.handler.handleEnvs(process.env, input.entity),
                  input.entity,
                  DataTypeEnum.envs,
                  pipeScopeList,
                );

                transformedArguments.push(pipedEnvs);
              }

              break;

            case InputTypeEnum.params:
              {
                const pipedParams = await this.handler.passPipes(
                  this.handler.handleParams(params, input.entity),
                  input.entity,
                  DataTypeEnum.params,
                  pipeScopeList,
                );

                transformedArguments.push(pipedParams);
              }
              break;

            case InputTypeEnum.options:
              {
                const pipedOptions = await this.handler.passPipes(
                  this.handler.handleOptions(options, input.entity),
                  input.entity,
                  DataTypeEnum.options,
                  pipeScopeList,
                );

                transformedArguments.push(pipedOptions);
              }
              break;

            case InputTypeEnum.helper:
              {
                const clirioHelper = new ClirioHelper({
                  scopedModule: getPrototype(module).constructor,
                  scopedActionName: actionName,
                  modules: this.modules,
                });

                transformedArguments.push(clirioHelper);
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

    for (const { module, moduleData, actionName } of this.iterateEmptyData()) {
      const data = this.handler.matchArgs(parsedArgs, moduleData.links);

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
    } of this.iterateFailureData()) {
      const length = moduleData.links.length;

      const data = this.handler.matchArgs(
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
        code: 'INCORRECT_COMMAND',
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
      commandData,
    } of this.iterateCommandData()) {
      const links = [...moduleData.links, ...commandData.links];

      const isActionMask =
        links.findIndex((link) =>
          [ArgPatternType.list, ArgPatternType.param].includes(link.type),
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

    let nextData: Omit<OptionArg, 'value'> | null = null;
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

        let data: Omit<OptionArg, 'value'>;

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
          key: Number(actionCount),
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
