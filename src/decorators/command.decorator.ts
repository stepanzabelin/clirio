import { argReg, optionReg } from '../constrains';
import { CommandTargetData, Constructor, Link, LinkType } from '../types';
import { commandTargetMetadata } from '../metadata';
import { ClirioDebugError } from '../exceptions';

export const Command = function (
  rawCommand: string,
  {
    description = null,
    hidden = false,
  }: Partial<Omit<CommandTargetData, 'command'>> = {},
) {
  return function (target: Constructor<any>['prototype'], propertyKey: string) {
    const command = rawCommand.trim();

    const links: Link[] = [];

    const devErrorData = {
      value: rawCommand,
      entity: target.constructor.name,
      property: propertyKey,
      decorator: 'Command',
    };

    let sub = command;

    while (sub) {
      const argMatch = sub.match(argReg);

      if (!argMatch) {
        throw new ClirioDebugError(
          'Command value is not correct',
          devErrorData,
        );
      }

      const { action, option, rest, param } = argMatch.groups!;

      if (action) {
        const values = action.split(/\s*\|\s*/);

        if (values.some((value) => !value)) {
          throw new ClirioDebugError(
            'Command value is not correct',
            devErrorData,
          );
        }

        links.push({
          type: LinkType.Action,
          values,
        });
      }

      if (param) {
        links.push({
          type: rest ? LinkType.List : LinkType.Param,
          values: [param],
        });
      }

      if (option) {
        const values: string[] = [];

        while (sub) {
          const optionMatch = sub.match(
            new RegExp(`^\\s*${optionReg.source}\\s*(,|$)`, 'i'),
          );

          if (!optionMatch) {
            throw new ClirioDebugError(
              'Command value is not correct',
              devErrorData,
            );
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

    commandTargetMetadata.setData(target, propertyKey, {
      command,
      links,
      description,
      hidden,
    });
  };
};
