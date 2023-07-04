import { optionReg } from '../constrains/regexp.config';
import { ClirioDebugError } from '../exceptions/ClirioDebugError';
import { optionTargetMetadata } from '../metadata';

import { Constructor, OptionTargetData } from '../types';

export const Option = function (
  optionLine?: string,
  { cast = null }: Partial<Omit<OptionTargetData, 'keys'>> = {}
) {
  return function (target: Constructor['prototype'], propertyName: string) {
    // if (isArray && variable) {
    //   throw new ClirioDebugError('The configuration is not correct', {
    //     entity: target.constructor.name,
    //     property: propertyName,
    //     decorator: 'Option',
    //   });
    // }

    if (!optionLine) {
      optionTargetMetadata.setData(target, propertyName, {
        keys: null,
        cast,
      });
      return;
    }

    const keys = optionLine
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
      keys,
      cast,
    });
  };
};
