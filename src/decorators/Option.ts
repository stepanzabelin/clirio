import { optionReg } from '../constrains/regexp.config';
import { ClirioDebugError } from '../exceptions/ClirioDebugError';
import { optionTargetMetadata } from '../metadata';

import { Constructor } from '../types';

export const Option = function (
  optionLine?: string,
  {
    isArray = false,
    nullableValue,
    variable = false,
  }: { isArray?: boolean; nullableValue?: any; variable?: boolean } = {}
) {
  return function (target: Constructor['prototype'], propertyName: string) {
    if (isArray && variable) {
      throw new ClirioDebugError('The configuration is not correct', {
        entity: target.constructor.name,
        property: propertyName,
        decorator: 'Option',
      });
    }

    if (!optionLine) {
      optionTargetMetadata.setData(target, propertyName, {
        aliases: null,
        isArray,
        nullableValue,
        variable,
      });
      return;
    }

    const aliases = optionLine
      .split(/\s*,\s*/)
      .filter((f) => f)
      .map((option) => {
        const match = option.match(
          new RegExp(`^\\s*${optionReg.source}\\s*(,|$)`, 'i')
        );
        if (!match) {
          throw new ClirioDebugError('An option value is not correct', {
            value: option,
            entity: target.constructor.name,
            property: propertyName,
            decorator: 'Option',
          });
        }
        return (match!.groups!['longName'] ?? match!.groups!['shortName'])!;
      });

    optionTargetMetadata.setData(target, propertyName, {
      aliases,
      isArray,
      nullableValue,
      variable,
    });
  };
};
