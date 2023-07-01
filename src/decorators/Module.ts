import { moduleCommandReg } from '../constrains/regexp.config';
import { Clirio } from '../lib/Clirio';

import { moduleEntityMetadata } from '../metadata';
import { Constructor, Link, LinkType } from '../types';

export const Module = function (rawCommand?: string) {
  return function (constructor: Constructor) {
    const links: Link[] = [];

    const command = rawCommand?.trim?.() ?? null;

    let sub = command;

    while (sub) {
      const commandMatch = sub.match(
        new RegExp(`^\\s*${moduleCommandReg.source}$\\s*`)
      );

      if (!commandMatch) {
        throw Clirio.debug('Command value is invalid', {
          entity: constructor.name,
          value: command!,
          decorator: 'Module',
        });
      }

      const { action } = commandMatch!.groups!;

      links.push({
        type: LinkType.Action,
        values: [action],
      });

      sub = sub.slice(commandMatch[0].length);
    }

    moduleEntityMetadata.set(constructor.prototype, {
      links,
      command,
    });
  };
};
