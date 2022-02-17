import { argReg, optionReg } from '../constrains/regexp.config';
import { ClirioDebug } from '../exceptions';
import { md } from '../metadata';
import { ActionType, Constructor, Link, LinkType } from '../types';

export const Command = function (rawCommand: string) {
  return function (target: Constructor['prototype'], propertyKey: string) {
    const links: Link[] = [];

    const devErrorData = {
      value: rawCommand,
      entity: target.constructor.name,
      property: propertyKey,
      decorator: 'Command',
    };

    const command = rawCommand.trim();
    let sub = command;

    while (sub) {
      const argMatch = sub.match(argReg);

      if (!argMatch) {
        ClirioDebug.fatal('Command value is not correct', devErrorData);
      }

      const { action, option, rest, mask } = argMatch!.groups!;

      if (action) {
        const values = action.split(/\s*\|\s*/);

        if (values.some((action) => !action)) {
          ClirioDebug.fatal('Command value is not correct', devErrorData);
        }

        links.push({
          type: LinkType.Action,
          values,
        });
      }

      if (mask) {
        links.push({
          type: rest ? LinkType.RestMask : LinkType.Mask,
          values: [mask],
        });
      }

      if (option) {
        const values: string[] = [];

        while (sub) {
          const optionMatch = sub.match(
            new RegExp(`^\\s*${optionReg.source}\\s*(,|$)`, 'i')
          );

          if (!optionMatch) {
            ClirioDebug.fatal('Command value is not correct', devErrorData);
          }
          const { shortName, longName } = optionMatch.groups!;
          values.push(shortName ?? longName);
          sub = sub.slice(optionMatch[0].length);
        }

        links.push({
          type: LinkType.Option,
          values,
        });
      }

      sub = sub.slice(argMatch[0].length);
    }

    md.action.setData(target, propertyKey, {
      type: ActionType.Command,
      links,
      command,
    });
  };
};
