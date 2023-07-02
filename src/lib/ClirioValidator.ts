import {
  Constructor,
  RawOptions,
  RawParams,
  PipeScope,
  LinkedArg,
  MappedLink,
} from '../types';
import {
  validateTargetMetadata,
  transformTargetMetadata,
  optionTargetMetadata,
  paramTargetMetadata,
} from '../metadata';
import { DataTypeEnum } from '../types/DataTypeEnum';
import { ClirioRouteError, ClirioValidationError } from '../exceptions';
// import { ClirioValidationError } from '../exceptions';

export class ClirioValidator {
  public isDto(dto: Constructor) {
    return dto && dto !== Object && typeof dto === 'function';
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
            allowedKeys: [paramData.paramName ?? propertyName],
            value,
            propertyName,
            mapped: true,
          });
        }
      } else {
        if (filteredLinkedArgs.length === 1) {
          mappedLinks.push({
            type: 'param',
            key: filteredLinkedArgs[0]!.key,
            allowedKeys: [paramData.paramName ?? propertyName],
            value: filteredLinkedArgs[0]!.value,
            propertyName,
            mapped: true,
          });
        } else if (filteredLinkedArgs.length > 1) {
          throw new ClirioRouteError('');
        }
      }
    }

    // this can't be
    // for (const linkedArg of parsedLinkedArgs) {
    //   mappedLinks.push({
    //     type: 'param',
    //     key: linkedArg.key,
    //     allowedKeys: [],
    //     value: linkedArg.value,
    //     propertyName: null,
    //     mapped: false,
    //   });
    // }

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
              allowedKeys: aliases,
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
              allowedKeys: aliases,
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
            allowedKeys: aliases,
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
        allowedKeys: [],
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

  public handlePipes(
    rawData: any,
    dto: Constructor,
    dataType: DataTypeEnum,
    pipeList: PipeScope[] = []
  ) {
    let data = rawData;

    for (const { pipe, scope } of pipeList) {
      const pipeInst: any = typeof pipe === 'function' ? new pipe() : pipe;

      data = pipeInst.transform({
        dataType,
        scope,
        dto,
        data,
      });
    }

    return data;
  }
}
