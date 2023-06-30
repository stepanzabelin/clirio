import { Constructor, RawOptions, RawParams, PipeScope } from '../types';
import {
  validateTargetMetadata,
  transformTargetMetadata,
  optionTargetMetadata,
  paramTargetMetadata,
} from '../metadata';
import { DataTypeEnum } from '../types/DataTypeEnum';
import { ClirioValidationError } from '../exceptions';
// import { ClirioValidationError } from '../exceptions';

export class ClirioValidator {
  public isDto(dto: Constructor) {
    return dto && dto !== Object;
  }

  public validateParams(
    params: RawParams,
    dto: Constructor
  ): Record<string, any> {
    if (!this.isDto(dto)) {
      return params;
    }
    const transformedParams: Record<string, any> = {};
    const paramsList = Array.from(paramTargetMetadata.getMap(dto.prototype));

    const takenPropertiesSet = new Set<string>();
    const propertiesMap = new Map<string, string>();

    for (const [propertyName, paramData] of paramsList) {
      const paramName = paramData.paramName ?? propertyName;
      takenPropertiesSet.add(paramName);
      propertiesMap.set(propertyName, paramName);

      if (params.hasOwnProperty(paramName)) {
        transformedParams[propertyName] = params[paramName];
      }
    }

    for (const property in params) {
      if (!takenPropertiesSet.has(property)) {
        transformedParams[property] = params[property];
      }
    }

    const handledParams = this.handle(transformedParams, dto);

    return handledParams;
  }

  public validateOptions(options: RawOptions, dto: Constructor): any {
    if (!this.isDto(dto)) {
      return options;
    }

    const transformedOptions: Record<string, any> = {};

    const optionsList = Array.from(optionTargetMetadata.getMap(dto.prototype));

    const takenPropertiesSet = new Set<string>();
    const propertiesMap = new Map<string, string>();

    for (const [propertyName, optionData] of optionsList) {
      const aliases = optionData?.aliases ?? [propertyName];
      for (const optionName of optionData?.aliases ?? [propertyName]) {
        takenPropertiesSet.add(optionName);

        propertiesMap.set(
          propertyName,
          aliases
            .map((name) => (name.length === 1 ? `-` : `--`) + name)
            .join(', ')
        );

        if (options.hasOwnProperty(optionName)) {
          if (optionData.variable) {
            for (const value of Array.isArray(options[optionName])
              ? options[optionName]
              : [options[optionName]]) {
              const matchVariable = String(value).match(
                /^(?<key>[^=]+)(=(?<value>[\s\S]*))?$/
              );

              if (matchVariable) {
                const { key, value } = matchVariable!.groups!;

                if (
                  transformedOptions.hasOwnProperty(propertyName) &&
                  typeof transformedOptions[propertyName] === 'object'
                ) {
                  transformedOptions[propertyName][key] = value;
                } else {
                  transformedOptions[propertyName] = { [key]: value };
                }
              }
            }
          } else if (
            transformedOptions.hasOwnProperty(propertyName) ||
            optionData.isArray
          ) {
            if (!Array.isArray(transformedOptions[propertyName])) {
              transformedOptions[propertyName] = [
                transformedOptions[propertyName],
              ];
            }

            transformedOptions[propertyName].push(options[optionName] ?? null);
          } else {
            transformedOptions[propertyName] = options[optionName] ?? null;
          }
        }
      }
    }

    for (const propertyName in options) {
      if (!takenPropertiesSet.has(propertyName)) {
        transformedOptions[propertyName] = options[propertyName];
      }
    }

    const handledOptions = this.handle(transformedOptions, dto);

    return handledOptions;
  }

  public handle(data: any, dto: Constructor<any>) {
    const newData = { ...data };

    for (const propertyName in data) {
      const validate = validateTargetMetadata.getDataField(
        dto.prototype,
        propertyName,
        'validate'
      );

      if (validate && !validate(data[propertyName])) {
        throw new ClirioValidationError(`Option "${propertyName}" is wrong`, {
          propertyName,
          dataType: DataTypeEnum.Options,
          module: class {},
          actionName: '',
        });
      }

      const transform = transformTargetMetadata.getDataField(
        dto.prototype,
        propertyName,
        'transform'
      );

      if (transform) {
        newData[propertyName] = transform(newData[propertyName]);
      }
    }

    return newData;
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
