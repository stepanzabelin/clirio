import { moduleCommandReg } from '../constrains/regexp.constrains';
import { ClirioDebugError } from '../exceptions';
import { moduleEntityMetadata } from '../metadata';
import { Constructor, ArgPattern, ArgPatternType, ModuleData } from '../types';

export const Module = function (
  rawCommand?: string,
  {
    description = null,
    hidden = false,
  }: Partial<Omit<ModuleData, 'command' | 'links'>> = {},
) {
  return function (constructor: Constructor<any>) {
    const links: ArgPattern[] = [];

    const command = rawCommand?.trim?.() ?? null;

    let sub = command;

    while (sub) {
      const commandMatch = sub.match(
        new RegExp(`^\\s*${moduleCommandReg.source}$\\s*`),
      );

      if (!commandMatch) {
        throw new ClirioDebugError('Command value is invalid', {
          entity: constructor.name,
          value: command,
          decorator: '.module',
        });
      }

      const { action } = commandMatch.groups!;

      links.push({
        type: ArgPatternType.action,
        values: [action],
      });

      sub = sub.slice(commandMatch[0].length);
    }

    moduleEntityMetadata.set(constructor.prototype, {
      links,
      command,
      description,
      hidden,
    });
  };
};
