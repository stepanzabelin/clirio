import {
  actionTargetMetadata,
  hiddenTargetMetadata,
  descriptionTargetMetadata,
  moduleEntityMetadata,
  optionTargetMetadata,
  optionsArgMetadata,
} from '../metadata';
import { ActionType, Constructor, InputTypeEnum } from '../types';

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
    const moduleData = moduleEntityMetadata.get(module.prototype)!;
    const actionMap = actionTargetMetadata.getMap(module.prototype);
    const results: ModuleData[] = [];

    for (const [propertyKey, actionData] of actionMap) {
      if (actionData.type !== ActionType.Command) {
        continue;
      }

      const description =
        descriptionTargetMetadata.getDataField(
          module.prototype,
          propertyKey,
          'description'
        ) ?? '';

      const hidden = hiddenTargetMetadata.getDataField(
        module.prototype,
        propertyKey,
        'hidden'
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

    const optionsArgMap = optionsArgMetadata.getArgMap(
      module.prototype,
      propertyKey
    );

    if (optionsArgMap.size > 0) {
      const { dto } = [...optionsArgMap.values()][0];

      const optionsList = Array.from(
        optionTargetMetadata.getMap(dto.prototype)
      );

      for (const [property, { keys }] of optionsList) {
        const description =
          descriptionTargetMetadata.getDataField(
            module.prototype,
            propertyKey,
            'description'
          ) ?? '';

        const hidden = hiddenTargetMetadata.getDataField(
          module.prototype,
          propertyKey,
          'hidden'
        );

        if (hidden) {
          continue;
        }

        const options = (keys ?? [property]).map((key) =>
          key.length > 1 ? `--${key}` : `-${key}`
        );

        optionDescription.push({
          options,
          description,
          type: null,
          itemType: null,
        });
      }
    }
    return optionDescription;
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
