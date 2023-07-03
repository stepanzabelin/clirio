import {
  Constructor,
  RawOptions,
  RawParams,
  PipeScope,
  LinkedArg,
  MappedLink,
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
import { ClirioRouteError, ClirioValidationError } from '../exceptions';
import { ClirioDefaultException } from './ClirioDefaultException';
// import { ClirioValidationError } from '../exceptions';

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

  public validateParams(
    linkedArgs: LinkedArg[],
    dto: Constructor
  ): MappedLink[] {
    const mappedLinks: MappedLink[] = [];

    let parsedLinkedArgs: LinkedArg[] = [...linkedArgs];

    const paramTargetDataList = this.isDto(dto)
      ? [...paramTargetMetadata.getMap(dto.prototype)]
      : [];

    // const paramsList = Array.from(paramTargetMetadata.getMap(dto.prototype));

    for (const [propertyName, paramData] of paramTargetDataList) {
      const filteredLinkedArgs = parsedLinkedArgs.filter(
        (linkedArg) => linkedArg.key === paramData.paramName
      );

      parsedLinkedArgs = parsedLinkedArgs.filter(
        (linkedArg) => linkedArg.key !== paramData.paramName
      );

      if (paramData.isArray) {
        if (filteredLinkedArgs.length > 0) {
          const value = filteredLinkedArgs.map((linkedArg) => linkedArg.value);

          mappedLinks.push({
            type: 'param',
            key: filteredLinkedArgs[0]!.key,
            definedKeys: [paramData.paramName ?? propertyName],
            value,
            propertyName,
            mapped: true,
          });
        }
      } else {
        mappedLinks.push({
          type: 'param',
          key: filteredLinkedArgs[0]!.key,
          definedKeys: [paramData.paramName ?? propertyName],
          value: filteredLinkedArgs[0]!.value,
          propertyName,
          mapped: true,
        });

        // if (filteredLinkedArgs.length === 1) {
        //   mappedLinks.push({
        //     type: 'param',
        //     key: filteredLinkedArgs[0]!.key,
        //     definedKeys: [paramData.paramName ?? propertyName],
        //     value: filteredLinkedArgs[0]!.value,
        //     propertyName,
        //     mapped: true,
        //   });
        // } else if (filteredLinkedArgs.length > 1) {
        //   throw new ClirioRouteError('');
        // }
      }
    }

    for (const linkedArg of parsedLinkedArgs) {
      mappedLinks.push({
        type: 'param',
        key: linkedArg.key,
        definedKeys: [],
        value: linkedArg.value,
        propertyName: null,
        mapped: false,
      });
    }

    const handledParams = this.handle(mappedLinks, dto, DataTypeEnum.Params);

    return handledParams;
  }

  public validateOptions(
    linkedArgs: LinkedArg[],
    dto: Constructor
  ): MappedLink[] {
    const mappedLinks: MappedLink[] = [];

    let parsedLinkedArgs: LinkedArg[] = [...linkedArgs];

    const optionTargetDataList = this.isDto(dto)
      ? [...optionTargetMetadata.getMap(dto.prototype)]
      : [];

    for (const [propertyName, optionData] of optionTargetDataList) {
      const aliases = optionData?.aliases ?? [propertyName];

      const filteredLinkedArgs = parsedLinkedArgs.filter((linkedArg) =>
        aliases.includes(linkedArg.key)
      );

      parsedLinkedArgs = parsedLinkedArgs.filter(
        (linkedArg) => !aliases.includes(linkedArg.key)
      );

      if (filteredLinkedArgs.length === 0) {
        continue;
      }

      // propertiesMap.set(
      //   propertyName,
      //   aliases
      //     .map((name) => (name.length === 1 ? `-` : `--`) + name)
      //     .join(', ')
      // );

      switch (true) {
        case optionData.variable:
          {
            const obj: any = {};

            for (const linkedArg of filteredLinkedArgs) {
              const matchVariable = String(linkedArg.value).match(
                /^(?<key>[^=]+)(=(?<value>[\s\S]*))?$/
              );

              if (matchVariable) {
                const { key, value } = matchVariable!.groups!;
                obj[key] = value;
              }
            }

            mappedLinks.push({
              type: 'option',
              key: filteredLinkedArgs[0]!.key,
              definedKeys: aliases,
              value: obj,
              propertyName,
              mapped: true,
            });
          }
          break;
        case optionData.isArray:
          {
            const values = filteredLinkedArgs.map(
              (filteredArg) => filteredArg.value
            );

            mappedLinks.push({
              type: 'option',
              key: filteredLinkedArgs[0]!.key,
              definedKeys: aliases,
              value: values,
              propertyName,
              mapped: true,
            });
          }
          break;
        default:
          if (filteredLinkedArgs.length > 1) {
            // TODO VALIDATION
            throw new Error('111');
          }

          mappedLinks.push({
            type: 'option',
            key: filteredLinkedArgs[0]!.key,
            definedKeys: aliases,
            value: filteredLinkedArgs[0]!.value,
            propertyName,
            mapped: true,
          });

          break;
      }
    }
    console.log({ parsedLinkedArgs });

    for (const linkedArg of parsedLinkedArgs) {
      mappedLinks.push({
        type: 'option',
        key: linkedArg.key,
        definedKeys: [],
        value: linkedArg.value,
        propertyName: null,
        mapped: false,
      });
    }

    const handledOptions = this.handle(mappedLinks, dto, DataTypeEnum.Options);

    return handledOptions;
  }

  public handle(
    linkedArgs: MappedLink[],
    dto: Constructor<any>,
    dataType: DataTypeEnum
  ): MappedLink[] {
    const handledLinkedArgs = [...linkedArgs];

    for (const linkedArg of linkedArgs) {
      if (!linkedArg.propertyName) {
        handledLinkedArgs.push(linkedArg);
        continue;
      }

      const validate = validateTargetMetadata.getDataField(
        dto.prototype,
        linkedArg.propertyName,
        'validate'
      );

      if (validate && !validate(linkedArg.value)) {
        throw new ClirioValidationError(
          `The "${linkedArg.key}" ${dataType.toLowerCase()} is wrong`,
          {
            dataType,
            ...linkedArg,
          }
        );
      }

      const transform = transformTargetMetadata.getDataField(
        dto.prototype,
        linkedArg.propertyName,
        'transform'
      );

      const transformedLinkedArg = { ...linkedArg };

      if (transform) {
        transformedLinkedArg.value = transform(transformedLinkedArg.value);
      }

      handledLinkedArgs.push(transformedLinkedArg);
    }

    return handledLinkedArgs;
  }

  public passPipes(
    mappedLinks: MappedLink[],
    dto: Constructor,
    dataType: DataTypeEnum,
    pipeList: PipeScope[] = []
  ) {
    let data = Object.fromEntries(
      mappedLinks.map((mappedLink) => [
        mappedLink.propertyName ?? mappedLink.key,
        mappedLink.value,
      ])
    );

    console.log({ data });

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
        case this.compareRestParam(link, attributes):
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

            for (const value of values) {
              linkedArgs.push({
                type: 'param',
                key: paramName,
                value,
              });
            }
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
        value: attributes.value,
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
    //     propertyName: null,
    //     mapped: false,
    //   }))
    // );

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
        case this.compareRestParam(link, attributes):
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
        case this.compareRestParam(link, attributes):
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

  private compareRestParam(link: Link, attributes: ParsedArg): boolean {
    return link.type === LinkType.List && attributes.type === ArgType.Action;
  }
}
