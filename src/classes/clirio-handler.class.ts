import {
  Constructor,
  RawOptions,
  RawParams,
  PipeScope,
  LinkedArg,
  Row,
  ExceptionScope,
  ClirioException,
  Link,
  ParsedArg,
  LinkType,
  ArgType,
  Exception,
  Pipe,
  ClirioPipe,
  DataTypeEnum,
} from '../types';
import {
  validateTargetMetadata,
  transformTargetMetadata,
  optionTargetMetadata,
  paramTargetMetadata,
  exceptionTargetMetadata,
  pipeTargetMetadata,
} from '../metadata';
import { ClirioValidationError } from '../exceptions';
import { getInstance, getPrototype, isEntity } from '../utils';

export class ClirioHandler {
  public handleExceptions(rawErr: any, exceptionList: ExceptionScope[] = []) {
    let currentErr = rawErr;

    for (const { exception, scope } of exceptionList) {
      const exceptionInst: ClirioException =
        typeof exception === 'function' ? new exception() : exception;

      try {
        exceptionInst.catch(currentErr, {
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

  public handleParams(
    linkedArgs: LinkedArg[],
    entity: Constructor<any>,
    dataType: DataTypeEnum,
  ): Row[] {
    const rows: Row[] = [];

    const parsedLinkedArgs: LinkedArg[] = [...linkedArgs];

    const paramTargetDataList = isEntity(entity)
      ? [...paramTargetMetadata.getMap(entity.prototype)]
      : [];

    for (const [propertyName, paramData] of paramTargetDataList) {
      const key = paramData.key ?? propertyName;

      const index = parsedLinkedArgs.findIndex(
        (linkedArg) => linkedArg.key === key,
      );

      if (index === -1) {
        continue;
      }

      const linkedArg = parsedLinkedArgs[index];
      parsedLinkedArgs.splice(index, 1);

      const value = linkedArg.value;

      rows.push({
        type: 'param',
        key: linkedArg.key,
        definedKeys: [key],
        value,
        propertyName,
        mapped: true,
      });
    }

    for (const linkedArg of parsedLinkedArgs) {
      rows.push({
        type: 'param',
        key: linkedArg.key,
        definedKeys: [],
        value: linkedArg.value,
        propertyName: null,
        mapped: false,
      });
    }

    this.validate(rows, entity, dataType);

    const transformRows = this.transform(rows, entity);

    return transformRows;
  }

  public handleOptions(
    linkedArgs: LinkedArg[],
    entity: Constructor<any>,
    dataType: DataTypeEnum,
  ): Row[] {
    const rows: Row[] = [];

    let parsedLinkedArgs: LinkedArg[] = [...linkedArgs];

    const optionTargetDataList = isEntity(entity)
      ? [...optionTargetMetadata.getMap(entity.prototype)]
      : [];

    for (const [propertyName, optionData] of optionTargetDataList) {
      const keys = optionData.keys ?? [propertyName];

      const filteredLinkedArgs = parsedLinkedArgs.filter((linkedArg) =>
        keys.includes(linkedArg.key),
      );

      parsedLinkedArgs = parsedLinkedArgs.filter(
        (linkedArg) => !keys.includes(linkedArg.key),
      );

      if (filteredLinkedArgs.length === 0) {
        continue;
      }

      const value =
        filteredLinkedArgs.length > 1
          ? filteredLinkedArgs.map((linkedArg) => linkedArg.value).flat()
          : filteredLinkedArgs[0].value;

      rows.push({
        type: 'option',
        key: filteredLinkedArgs[0].key,
        definedKeys: keys,
        value,
        propertyName,
        mapped: true,
      });
    }

    for (const linkedArg of parsedLinkedArgs) {
      rows.push({
        type: 'option',
        key: linkedArg.key,
        definedKeys: [],
        value: linkedArg.value,
        propertyName: null,
        mapped: false,
      });
    }

    this.validate(rows, entity, dataType);

    const transformRows = this.transform(rows, entity);

    return transformRows;
  }

  public validate(
    rows: Row[],
    entity: Constructor<any>,
    dataType: DataTypeEnum,
  ): void {
    const validationMap = validateTargetMetadata.getMap(entity.prototype);

    for (const [propertyName, data] of validationMap) {
      const row = rows.find((row) => row.propertyName === propertyName);

      for (const check of data.checks) {
        const result = check(row?.value);

        if (result === false) {
          const key = row?.key ?? propertyName;

          throw new ClirioValidationError(
            `The "${key}" ${dataType.toLowerCase()} is wrong`,
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

  public transform(rows: Row[], entity: Constructor<any>): Row[] {
    const transformedRows = [...rows];

    const transformMap = transformTargetMetadata.getMap(entity.prototype);

    for (const [propertyName, data] of transformMap) {
      const index = transformedRows.findIndex(
        (row) => row.propertyName === propertyName,
      );

      if (index === -1) {
        continue;
      }

      const transformedRow = transformedRows[index];

      transformedRows[index] = {
        ...transformedRow,
        value: data.transform(transformedRow.value),
      };
    }

    return transformedRows;
  }

  public passPipes(
    rows: Row[],
    entity: Constructor<any>,
    dataType: DataTypeEnum,
    pipeList: PipeScope[] = [],
  ) {
    let data = Object.fromEntries(
      rows.map((row) => [row.propertyName ?? row.key, row.value]),
    );

    for (const { pipe, scope } of pipeList) {
      const pipeInst: ClirioPipe =
        typeof pipe === 'function' ? new pipe() : pipe;

      data = pipeInst.transform(data, {
        dataType,
        scope,
        entity,
        rows,
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
      pipeScopeList.push({ scope: 'command', pipe: pipeMetadata.pipe });

      if (pipeMetadata.overwriteGlobal) {
        pipeScopeList = pipeScopeList.filter((item) => item.scope !== 'global');
      }
    }

    return pipeScopeList;
  }

  collectExceptions(
    globalException: Exception | null,
    module?: Constructor<any>,
    actionName?: string,
  ): ExceptionScope[] {
    let exceptionScopeList: ExceptionScope[] = [];

    if (globalException) {
      exceptionScopeList.push({
        scope: 'global',
        exception: globalException,
      });
    }

    if (module && actionName) {
      const exceptionMetadata = exceptionTargetMetadata.getData(
        getPrototype(module),
        actionName,
      );

      if (exceptionMetadata) {
        exceptionScopeList.push({
          scope: 'command',
          exception: exceptionMetadata.exception,
        });

        if (exceptionMetadata.overwriteGlobal) {
          exceptionScopeList = exceptionScopeList.filter(
            (item) => item.scope !== 'global',
          );
        }
      }
    }

    return exceptionScopeList;
  }

  public linkArgs(parsedArgs: ParsedArg[], links: Link[]): null | LinkedArg[] {
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
        case this.compareParam(link, attributes):
          {
            const [paramName] = link.values;

            linkedArgs.push({
              type: 'param',
              key: paramName,
              value: attributes.value,
            });
          }
          break;
        case this.compareParamList(link, attributes):
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
              value: values,
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
        (attributes) => attributes.type === ArgType.Action,
      ) > -1
    ) {
      return null;
    }

    const parsedOptions = restParsedArgs.filter(
      (attributes) => attributes.type === ArgType.Option,
    );

    const optionMap = new Map<string, any>();

    for (let index = 0; index < parsedOptions.length; index++) {
      const attributes = parsedOptions[index];

      const values = optionMap.get(attributes.key) ?? [];
      values.push(attributes.value);
      optionMap.set(attributes.key, values);
    }

    for (const [key, values] of optionMap) {
      linkedArgs.push({
        type: 'option',
        key,
        value: values.length > 1 ? values : values[0],
      });
    }

    return linkedArgs;
  }

  public matchRoute(
    parsedArgs: ParsedArg[],
    links: Link[],
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
        case this.compareParam(link, attributes):
          {
            const [paramName] = link.values;
            params[paramName] = attributes.value!;
          }
          break;
        case this.compareParamList(link, attributes):
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
        (attributes) => attributes.type === ArgType.Action,
      ) > -1
    ) {
      return null;
    }

    const parsedOptions = restParsedArgs.filter(
      (attributes) => attributes.type === ArgType.Option,
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

  private compareParam(link: Link, attributes: ParsedArg): boolean {
    return link.type === LinkType.Param && attributes.type === ArgType.Action;
  }

  private compareParamList(link: Link, attributes: ParsedArg): boolean {
    return link.type === LinkType.List && attributes.type === ArgType.Action;
  }
}
