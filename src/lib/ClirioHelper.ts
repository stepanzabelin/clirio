import Joi from 'joi';
import { getClassSchema } from 'joi-class-decorators';
import { md } from '../metadata';
import { ActionType, Constructor, InputTypeEnum } from '../types';
// import { formatTwoCols } from './format';

type OptionsData = {
  options: string[];
  description: string;
  type: string | null;
  itemType: string | null;
};

type ModuleData = {
  command: string;
  moduleCommand: string | null;
  actionCommand: string;
  description: string;
  optionDescription: OptionsData[];
};

type Scoped = {
  actionName: string;
  module: Constructor;
};

export class ClirioHelper {
  private readonly modules: Constructor[];
  private readonly scoped: Scoped;

  constructor({ modules, scoped }: { modules: Constructor[]; scoped: Scoped }) {
    this.modules = modules;
    this.scoped = scoped;
  }

  public describeModule(module: Constructor): ModuleData[] {
    const moduleData = md.module.get(module.prototype)!;
    const actionMap = md.action.get(module.prototype);
    const results = [];

    for (const [propertyKey, actionData] of actionMap) {
      const action = md.action.get(module.prototype).get(propertyKey)!;

      if (action.type !== ActionType.Command) {
        continue;
      }

      const { description, hidden } = md.help.getData(
        module.prototype,
        propertyKey
      );

      if (hidden) {
        continue;
      }

      const optionDescription = this.describeActionOptions(module, propertyKey);

      const command = [moduleData.command, actionData.command]
        .filter((f) => f)
        .join(' ');

      results.push({
        command,
        moduleCommand: moduleData.command,
        actionCommand: actionData.command!,
        description,
        optionDescription,
      });
    }

    return results;
  }

  private describeActionOptions(
    module: Constructor,
    propertyKey: string
  ): OptionsData[] {
    const optionDescription: OptionsData[] = [];

    const inputArguments = Array.from(
      md.input.get(module.prototype, propertyKey)
    );

    const inputArgumentsOptions = inputArguments.find(
      ([, params]) => params.type === InputTypeEnum.Options
    );

    if (inputArgumentsOptions) {
      const { dto } = inputArgumentsOptions[1];

      const schemaDescription = getClassSchema(dto).describe();

      const optionsList = Array.from(md.option.get(dto.prototype));

      for (const [property, { aliases }] of optionsList) {
        const { description, hidden } = md.help.getData(
          dto.prototype,
          property
        );

        if (hidden) {
          continue;
        }

        const options = (aliases ?? [property]).map((alias) =>
          alias.length > 1 ? `--${alias}` : `-${alias}`
        );

        optionDescription.push({
          options,
          description,
          ...this.getSchemaPropertyType(schemaDescription, property),
        });
      }
    }
    return optionDescription;
  }

  public getSchemaPropertyType(
    schemaDescription: Joi.Description,
    property: string
  ): { type: null | string; required: boolean; itemType: null | string } {
    if (schemaDescription.keys[property]) {
      const { type, flags, items } = schemaDescription.keys[property];
      return {
        type,
        required: flags?.presence === 'required',
        itemType: items?.[0]?.type ?? null,
      };
    } else {
      return { type: null, required: false, itemType: null };
    }
  }

  public describeAllModules(): ModuleData[] {
    return this.modules
      .map((module) => this.describeModule(module))
      .flatMap((f) => f);
  }

  public describeScopedModule(): ModuleData[] {
    return this.describeModule(this.scoped.module);
  }

  private static formatType(
    type: string | null,
    itemType: string | null
  ): string {
    if (!type) {
      return '';
    } else if (['number', 'string'].includes(type)) {
      return `<${type}>`;
    } else if (type === 'array') {
      const subType =
        itemType && ['number', 'string'].includes(itemType) ? itemType : '';
      return `<...${subType}>`;
    }
    return '';
  }

  public static formatActionDescription(
    optionDescription: OptionsData[],
    { showType = true }: { showType?: boolean } = {}
  ): string {
    let content = '';

    for (const { options, type, itemType, description } of optionDescription) {
      const col1 =
        options.join(', ') +
        ' ' +
        (showType ? this.formatType(type, itemType) : '');
      content +=
        this.formatTwoCols([col1.trim(), description], {
          firstColLen: 22,
          indent: 4,
        }) + `\n`;
    }

    return content;
  }

  public static formatModuleDescription(
    moduleDescription: ModuleData[],
    { showOptions = true }: { showOptions?: boolean } = {}
  ): string {
    let content = '';

    for (const moduleData of moduleDescription) {
      const { command, description, optionDescription } = moduleData;
      content +=
        this.formatTwoCols([command, description], {
          firstColLen: 24,
          indent: 2,
        }) + `\n`;

      if (showOptions && optionDescription.length > 0) {
        content += `\n`;
        content += this.formatActionDescription(optionDescription);
        content += `\n`;
      }
    }

    return content;
  }

  public static formatTwoCols(
    row: [string, string],
    options: {
      firstColLen?: number;
      indent?: number;
      height?: number;
    } = {}
  ): string {
    const { firstColLen, indent, height } = {
      firstColLen: 24,
      indent: 2,
      height: 80,
      ...options,
    };

    const separatorLen = 2;
    const col1 = row[0].padEnd(firstColLen, ' ');

    const col2 = this.formatShift(row[1], {
      shift: firstColLen + indent + separatorLen,
      height,
    });

    let line = ' '.repeat(indent);
    line += col1;
    line +=
      col1.length > firstColLen && col2
        ? '\n' + ' '.repeat(firstColLen + indent)
        : '';
    line += ' '.repeat(separatorLen);
    line += col2;
    return line;
  }

  private static formatShift(
    text: string,
    { shift, height }: { shift: number; height: number }
  ): string {
    let sub = text;
    const len = height - shift;
    const lines: string[] = [];

    while (sub.length > 0) {
      const spaceIndex = sub.length > len ? sub.lastIndexOf(' ', len) : len;
      const end = spaceIndex > -1 ? Math.min(spaceIndex, len) : len;
      lines.push(sub.slice(0, end));
      sub = sub.slice(end + 1);
    }

    return lines.join(`\n` + ' '.repeat(shift));
  }
}
