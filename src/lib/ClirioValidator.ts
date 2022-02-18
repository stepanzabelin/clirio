import { getClassSchema } from 'joi-class-decorators';
import Joi from 'joi';
import { Constructor, RawOptions, RawParams } from '../types';
import { md } from '../metadata';
import { ClirioError } from '../exceptions';

export class ClirioValidator {
  public isDto(dto: Constructor) {
    return dto && dto !== Object;
  }

  public extendSchema(
    schema: Joi.Schema<any>,
    propertyNames: string[]
  ): Joi.Schema<any> {
    const schemaDescription = schema.describe();
    for (const propertyName of propertyNames) {
      if (!(propertyName in schemaDescription.keys)) {
        Object.assign(
          schema,
          (schema as any)?.keys?.({
            [propertyName]: Joi.any(),
          })
        );
      }
    }

    return schema;
  }

  private validateSchema(
    schema: Joi.Schema<any>,
    raw: any,
    crossMap?: Map<string, string>
  ): any {
    const { value, error } = schema.validate(raw);

    if (error) {
      let { message } = error;
      const { label } = error.details[0].context!;

      if (crossMap) {
        for (const [propertyName, name] of crossMap) {
          const match = String(label).match(
            new RegExp(`^${propertyName}\\b.*?$`)
          );

          if (match) {
            message = message.replace(`"${match[0]}"`, `"${name}"`);
          }
        }
      }

      throw new Error(message);
    }

    return value;
  }

  public validateParams(
    params: RawParams,
    dto: Constructor
  ): Record<string, any> {
    if (!this.isDto(dto)) {
      return params;
    }
    const transformedParams: Record<string, any> = {};
    const paramsList = Array.from(md.param.get(dto.prototype));

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

    const schema = this.extendSchema(
      getClassSchema(dto),
      paramsList.map(([propertyName]) => propertyName)
    );

    try {
      return this.validateSchema(schema, transformedParams, propertiesMap);
    } catch (err: unknown) {
      throw new ClirioError(err instanceof Error ? err.message : String(err), {
        title: 'Command',
      });
    }
  }

  public validateOptions(
    options: RawOptions,
    dto: Constructor,
    { nullableOptionValue }: { nullableOptionValue?: any } = {}
  ): Record<string, any> {
    if (!this.isDto(dto)) {
      return options;
    }

    const transformedOptions: Record<string, any> = {};

    const optionsList = Array.from(md.option.get(dto.prototype));

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

            transformedOptions[propertyName].push(
              options[optionName] ?? nullableOptionValue
            );
          } else {
            transformedOptions[propertyName] =
              options[optionName] ?? nullableOptionValue;
          }
        }
      }
    }

    for (const propertyName in options) {
      if (!takenPropertiesSet.has(propertyName)) {
        transformedOptions[propertyName] = options[propertyName];
      }
    }

    const schema = this.extendSchema(
      getClassSchema(dto),
      optionsList.map(([propertyName]) => propertyName)
    );

    try {
      return this.validateSchema(schema, transformedOptions, propertiesMap);
    } catch (err: unknown) {
      throw new ClirioError(err instanceof Error ? err.message : String(err), {
        title: 'Options',
      });
    }
  }
}
