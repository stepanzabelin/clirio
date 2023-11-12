import {
  Constructor,
  RawOptions,
  RawParams,
  PipeScope,
  OptionArg,
  FilterScope,
  ClirioFilter,
  ArgPattern,
  ParsedArg,
  ArgPatternType,
  ArgType,
  Filter,
  Pipe,
  ClirioPipe,
  DataTypeEnum,
} from '../types';
import {
  validateTargetMetadata,
  transformTargetMetadata,
  optionTargetMetadata,
  paramTargetMetadata,
  filterTargetMetadata,
  pipeTargetMetadata,
  envTargetMetadata,
} from '../metadata';
import { ClirioValidationError } from '../exceptions';
import { getInstance, getPrototype, isConstructor } from '../utils';

export class ClirioHandler {
  public handleFilters(rawErr: any, filterList: FilterScope[] = []) {
    let currentErr = rawErr;

    for (const { filter, scope } of filterList) {
      const filterInst: ClirioFilter = getInstance(filter);

      try {
        filterInst.catch(currentErr, {
          scope,
        });
      } catch (err) {
        currentErr = err;
      }
    }

    throw currentErr;
  }

  async applyAction(
    module: Constructor<any>,
    actionName: string,
    transformedArguments: any[],
  ) {
    await Reflect.apply(
      getPrototype(module)[actionName],
      getInstance(module),
      transformedArguments,
    );
  }

  public handleParams(rawParams: RawParams, entity: Constructor<any>): any {
    const params: any = { ...rawParams };

    const paramTargetDataList = isConstructor(entity)
      ? [...paramTargetMetadata.getMap(entity.prototype)]
      : [];

    for (const [propertyName, paramData] of paramTargetDataList) {
      if (paramData.key === null || paramData.key === propertyName) {
        continue;
      }

      if (params.hasOwnProperty(paramData.key)) {
        if (params.hasOwnProperty(propertyName)) {
          if (Array.isArray(params[propertyName])) {
            if (Array.isArray(params[paramData.key])) {
              params[propertyName].push(...params[paramData.key]);
            } else {
              params[propertyName].push(params[paramData.key]);
            }
          } else {
            if (Array.isArray(params[paramData.key])) {
              params[propertyName] = [
                params[propertyName],
                ...params[paramData.key],
              ];
            } else {
              params[propertyName] = [
                params[propertyName],
                params[paramData.key],
              ];
            }
          }
        } else {
          params[propertyName] = params[paramData.key];
        }

        delete params[paramData.key];
      }
    }

    this.validate(params, entity, DataTypeEnum.params);

    return this.transform(params, entity);
  }

  public handleOptions(rawOptions: RawOptions, entity: Constructor<any>): any {
    const options: any = { ...rawOptions };

    const optionTargetDataList = isConstructor(entity)
      ? [...optionTargetMetadata.getMap(entity.prototype)]
      : [];

    for (const [propertyName, optionData] of optionTargetDataList) {
      if (optionData.keys === null) {
        continue;
      }

      for (const key of optionData.keys) {
        if (key === propertyName) {
          continue;
        }

        if (options.hasOwnProperty(key)) {
          if (options.hasOwnProperty(propertyName)) {
            if (Array.isArray(options[propertyName])) {
              if (Array.isArray(options[key])) {
                options[propertyName].push(...options[key]);
              } else {
                options[propertyName].push(options[key]);
              }
            } else {
              if (Array.isArray(options[key])) {
                options[propertyName] = [
                  options[propertyName],
                  ...options[key],
                ];
              } else {
                options[propertyName] = [options[propertyName], options[key]];
              }
            }
          } else {
            options[propertyName] = options[key];
          }

          delete options[key];
        }
      }
    }

    this.validate(options, entity, DataTypeEnum.options);

    return this.transform(options, entity);
  }

  public validate(
    data: any,
    entity: Constructor<any>,
    dataType: DataTypeEnum,
  ): void {
    const validationMap = validateTargetMetadata.getMap(entity.prototype);

    for (const [propertyName, { checks }] of validationMap) {
      const value = data[propertyName];

      for (const check of checks) {
        const result = check(value);

        if (result === false) {
          // TODO GET KEY NAME
          throw new ClirioValidationError(
            `The "${propertyName}" ${dataType.toLowerCase()} is wrong`,
            {
              dataType,
              propertyName,
            },
          );
        } else if (result === true) {
          break;
        }
      }
    }
  }

  public handleEnvs(
    rawEnvs: NodeJS.Process['env'],
    entity: Constructor<any>,
  ): any {
    const envs: any = { ...rawEnvs };

    const envTargetDataList = isConstructor(entity)
      ? [...envTargetMetadata.getMap(entity.prototype)]
      : [];

    for (const [propertyName, envData] of envTargetDataList) {
      if (envData.key === null) {
        continue;
      }

      envs[propertyName] = envs[envData.key];

      delete envs[envData.key];
    }

    this.validate(envs, entity, DataTypeEnum.envs);

    return this.transform(envs, entity);
  }

  public transform(data: any, entity: Constructor<any>): any {
    const transformMap = transformTargetMetadata.getMap(entity.prototype);

    for (const [propertyName, { transform }] of transformMap) {
      data[propertyName] = transform(data[propertyName]);
    }

    return data;
  }

  public async passPipes(
    rawData: any,
    entity: Constructor<any>,
    dataType: DataTypeEnum,
    pipeList: PipeScope[] = [],
  ): Promise<any> {
    let data = rawData;

    for (const { pipe, scope } of pipeList) {
      const pipeInst: ClirioPipe = getInstance(pipe);

      data = await pipeInst.transform.bind(pipeInst)(rawData, {
        dataType,
        scope,
        entity,
      });
    }

    return data;
  }

  public collectPipes(
    globalPipe: Pipe | null,
    module: Constructor<any>,
    actionName: string,
  ): PipeScope[] {
    let pipeScopeList: PipeScope[] = [];

    const pipeMetadata = pipeTargetMetadata.getData(
      getPrototype(module),
      actionName,
    );

    if (globalPipe) {
      pipeScopeList.push({ scope: 'global', pipe: globalPipe });
    }

    if (pipeMetadata) {
      pipeScopeList.push({ scope: 'action', pipe: pipeMetadata.pipe });

      if (pipeMetadata.overwriteGlobal) {
        pipeScopeList = pipeScopeList.filter((item) => item.scope !== 'global');
      }
    }

    return pipeScopeList;
  }

  collectFilters(
    globalFilter: Filter | null,
    module?: Constructor<any>,
    actionName?: string,
  ): FilterScope[] {
    let filterScopeList: FilterScope[] = [];

    if (globalFilter) {
      filterScopeList.push({
        scope: 'global',
        filter: globalFilter,
      });
    }

    if (module && actionName) {
      const filterMetadata = filterTargetMetadata.getData(
        getPrototype(module),
        actionName,
      );

      if (filterMetadata) {
        filterScopeList.push({
          scope: 'action',
          filter: filterMetadata.filter,
        });

        if (filterMetadata.overwriteGlobal) {
          filterScopeList = filterScopeList.filter(
            (item) => item.scope !== 'global',
          );
        }
      }
    }

    return filterScopeList;
  }

  public matchArgs(
    actionArgs: ParsedArg[],
    links: ArgPattern[],
  ): null | {
    params: RawParams;
    options: RawOptions;
  } {
    const params: RawParams = {};
    const options: RawOptions = {};

    let actionIndex = 0;

    for (const link of links) {
      if (!actionArgs.hasOwnProperty(actionIndex)) {
        return null;
      }

      const attributes = actionArgs[actionIndex];

      switch (true) {
        case this.compareOption(link, attributes):
          break;
        case this.compareAction(link, attributes):
          break;
        case this.compareParam(link, attributes):
          {
            const [paramName] = link.values;
            params[paramName] = attributes.value as string;
          }
          break;
        case this.compareParamList(link, attributes):
          {
            const values: string[] = [];

            for (let index = actionIndex; index < actionArgs.length; index++) {
              const parsedArg = actionArgs[index];
              if (parsedArg.type === ArgType.Action) {
                values.push(parsedArg.value);
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

    const restParsedArgs = actionArgs.slice(actionIndex);

    if (
      restParsedArgs.findIndex(
        (attributes) => attributes.type === ArgType.Action,
      ) > -1
    ) {
      return null;
    }

    const optionArgList: OptionArg[] = restParsedArgs.filter(
      (optionArg) => optionArg.type === ArgType.Option,
    ) as OptionArg[];

    for (const optionArg of optionArgList) {
      if (options.hasOwnProperty(optionArg.key)) {
        if (Array.isArray(options[optionArg.key])) {
          (options[optionArg.key] as OptionArg['value'][]).push(
            optionArg.value,
          );
        } else {
          options[optionArg.key] = [
            options[optionArg.key] as string | null,
            optionArg.value,
          ];
        }
      } else {
        options[optionArg.key] = optionArg.value;
      }
    }

    return {
      params,
      options,
    };
  }

  private compareOption(link: ArgPattern, attributes: ParsedArg): boolean {
    return (
      link.type === ArgPatternType.option &&
      attributes.type === ArgType.Option &&
      link.values.includes(attributes.key) &&
      attributes.value === null
    );
  }

  private compareAction(link: ArgPattern, attributes: ParsedArg): boolean {
    return (
      link.type === ArgPatternType.action &&
      attributes.type === ArgType.Action &&
      link.values.includes(attributes.value)
    );
  }

  private compareParam(link: ArgPattern, attributes: ParsedArg): boolean {
    return (
      link.type === ArgPatternType.param && attributes.type === ArgType.Action
    );
  }

  private compareParamList(link: ArgPattern, attributes: ParsedArg): boolean {
    return (
      link.type === ArgPatternType.list && attributes.type === ArgType.Action
    );
  }
}
