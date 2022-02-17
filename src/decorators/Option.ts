import { optionReg } from '../constrains/regexp.config';
import { ClirioDebug } from '../exceptions';
import { md } from '../metadata';
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
      ClirioDebug.fatal('The configuration is not correct', {
        entity: target.constructor.name,
        property: propertyName,
        decorator: 'Option',
      });
    }

    if (!optionLine) {
      md.option.merge(target, propertyName, {
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
          ClirioDebug.fatal('An option value is not correct', {
            value: option,
            entity: target.constructor.name,
            property: propertyName,
            decorator: 'Option',
          });
        }
        return (match!.groups!['longName'] ?? match!.groups!['shortName'])!;
      });

    md.option.merge(target, propertyName, {
      aliases,
      isArray,
      nullableValue,
      variable,
    });
  };
};
