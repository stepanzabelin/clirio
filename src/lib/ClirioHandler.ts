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
} from '../types';
import {
  validateTargetMetadata,
  transformTargetMetadata,
  optionTargetMetadata,
  paramTargetMetadata,
  exceptionTargetMetadata,
  pipeTargetMetadata,
} from '../metadata';
import { DataTypeEnum } from '../types/DataTypeEnum';
import { ClirioValidationError } from '../exceptions';
import { ClirioDefaultException } from './ClirioDefaultException';

export class ClirioHandler {
  public isDto(dto: Constructor) {
    return dto && dto !== Object && typeof dto === 'function';
  }

  public getPrototype(
    entity: Constructor<any> | Constructor<any>['prototype']
  ) {
    return typeof entity === 'function'
      ? entity.prototype
      : entity.constructor.prototype;
  }

  public getInstance(entity: Constructor<any> | Constructor<any>['prototype']) {
    return typeof entity === 'function' ? new entity() : entity;
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

  public handleParams(
    linkedArgs: LinkedArg[],
    dto: Constructor,
    dataType: DataTypeEnum
  ): Row[] {
    const rows: Row[] = [];

    const parsedLinkedArgs: LinkedArg[] = [...linkedArgs];

    const paramTargetDataList = this.isDto(dto)
      ? [...paramTargetMetadata.getMap(dto.prototype)]
      : [];

    for (const [propertyName, paramData] of paramTargetDataList) {
      const key = paramData.key ?? propertyName;

      const index = parsedLinkedArgs.findIndex(
        (linkedArg) => linkedArg.key === key
      );

      if (index === -1) {
        continue;
      }

      const linkedArg = parsedLinkedArgs[index];
      parsedLinkedArgs.splice(index, 1);

      const value = this.cast(linkedArg.value, paramData.cast);

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

    this.validate(rows, dto, dataType);

    const transformRows = this.transform(rows, dto);

    return transformRows;
  }

  public handleOptions(
    linkedArgs: LinkedArg[],
    dto: Constructor,
    dataType: DataTypeEnum
  ): Row[] {
    const rows: Row[] = [];

    let parsedLinkedArgs: LinkedArg[] = [...linkedArgs];

    const optionTargetDataList = this.isDto(dto)
      ? [...optionTargetMetadata.getMap(dto.prototype)]
      : [];

    for (const [propertyName, optionData] of optionTargetDataList) {
      const keys = optionData.keys ?? [propertyName];

      const filteredLinkedArgs = parsedLinkedArgs.filter((linkedArg) =>
        keys.includes(linkedArg.key)
      );

      parsedLinkedArgs = parsedLinkedArgs.filter(
        (linkedArg) => !keys.includes(linkedArg.key)
      );

      if (filteredLinkedArgs.length === 0) {
        continue;
      }

      const linkedArg = filteredLinkedArgs[0];

      const value = this.cast(
        filteredLinkedArgs.length > 1
          ? filteredLinkedArgs.map((linkedArg) => linkedArg.value)
          : linkedArg.value,
        optionData.cast
      );

      rows.push({
        type: 'option',
        key: linkedArg.key,
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

    this.validate(rows, dto, dataType);

    const transformRows = this.transform(rows, dto);

    return transformRows;
  }

  public validate(
    rows: Row[],
    dto: Constructor<any>,
    dataType: DataTypeEnum
  ): void {
    const validationMap = validateTargetMetadata.getMap(dto.prototype);

    for (const [propertyName, data] of validationMap) {
      const row = rows.find((row) => row.propertyName === propertyName);

      if (!row) {
        continue;
      }

      for (const check of data.checks) {
        if (check(row.value) === false) {
          throw new ClirioValidationError(
            `The "${row.key}" ${dataType.toLowerCase()} is wrong`,
            {
              dataType,
              ...row,
            }
          );
        }
      }
    }
  }

  public transform(rows: Row[], dto: Constructor<any>): Row[] {
    const transformedRows = [...rows];

    const transformMap = transformTargetMetadata.getMap(dto.prototype);

    for (const [propertyName, data] of transformMap) {
      const index = transformedRows.findIndex(
        (row) => row.propertyName === propertyName
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
    dto: Constructor,
    dataType: DataTypeEnum,
    pipeList: PipeScope[] = []
  ) {
    let data = Object.fromEntries(
      rows.map((row) => [row.propertyName ?? row.key, row.value])
    );

    for (const { pipe, scope } of pipeList) {
      const pipeInst: ClirioPipe =
        typeof pipe === 'function' ? new pipe() : pipe;

      data = pipeInst.transform(data, {
        dataType,
        scope,
        dto,
        rows,
      });
    }

    return data;
  }

  public collectPipes(
    globalPipe: Pipe | null,
    module: Constructor<any>,
    actionName: string
  ): PipeScope[] {
    let pipeScopeList: PipeScope[] = [];

    const pipeMetadata = pipeTargetMetadata.getData(
      this.getPrototype(module),
      actionName
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
    actionName?: string
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
        (attributes) => attributes.type === ArgType.Action
      ) > -1
    ) {
      return null;
    }

    const parsedOptions = restParsedArgs.filter(
      (attributes) => attributes.type === ArgType.Option
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
        value: values.length > 2 ? values : values[0],
      });
    }

    return linkedArgs;
  }

  public countMatchRoute(parsedArgs: ParsedArg[], links: Link[]): number {
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
        case this.compareParam(link, attributes):
          break;
        case this.compareParamList(link, attributes):
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

  public matchRoute(
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

  private cast(value: any, cast: null | 'array' | 'plain'): any {
    switch (cast) {
      case 'array': {
        return Array.isArray(value) ? value : [value];
      }
      case 'plain': {
        return Array.isArray(value) ? value[0] : value;
      }
      default:
        return value;
    }
  }
}
