import {
  actionTargetMetadata,
  moduleEntityMetadata,
  optionTargetMetadata,
  optionsArgMetadata,
} from '../metadata';
import { ActionType, Constructor } from '../types';
import { getPrototype } from '../utils';

type OptionsData = {
  options: string[];
  description: string;
};

type ModuleData = {
  entity: Constructor<any>;
  command: string;
};

type ActionData = {
  name: string;
  command: string;
  description: string | null;
  hidden: boolean;
};

type Scope = {
  moduleEntity: Constructor<any>;
  actionName: string;
};

type Field = {
  keys: string[];
  propertyName: string;
  description: string;
};

type Input = {
  entity: Constructor<any> | null;
  type: 'params' | 'options';
  fields: Field[];
};

type DumpItem = {
  module: ModuleData;
  action: ActionData;
  inputs: Input[];
};

export class ClirioHelper {
  private readonly modules: Constructor<any>[];
  private readonly scopedModuleEntity: Constructor<any>;
  private readonly scopedActionName: string;

  constructor({
    modules,
    scopedModuleEntity,
    scopedActionName,
  }: {
    scopedModuleEntity: Constructor<any>;
    modules: Constructor<any>[];
    scopedActionName: string;
  }) {
    this.modules = modules;
    this.scopedActionName = scopedActionName;
    this.scopedModuleEntity = scopedModuleEntity;
  }

  public dumpModule(module: Constructor<any>): DumpItem[] {
    const moduleData = moduleEntityMetadata.get(getPrototype(module))!;
    const actionMap = actionTargetMetadata.getMap(getPrototype(module));
    const results: DumpItem[] = [];

    for (const [propertyKey, actionData] of actionMap) {
      if (actionData.type !== ActionType.Command) {
        continue;
      }
      const description = null;
      const hidden = false;

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
        actionCommand: actionData.command,
        description,
        optionDescription,
      } as any);
    }

    return results;
  }

  private describeActionOptions(
    module: Constructor<any>,
    propertyKey: string,
  ): OptionsData[] {
    const optionDescription: OptionsData[] = [];

    const optionsArgMap = optionsArgMetadata.getArgMap(
      getPrototype(module),
      propertyKey,
    );

    if (optionsArgMap.size > 0) {
      const { entity } = [...optionsArgMap.values()][0];

      const optionsList = Array.from(
        optionTargetMetadata.getMap(entity.prototype),
      );

      for (const [property, { keys }] of optionsList) {
        const description = '';

        const hidden = false;

        if (hidden) {
          continue;
        }

        const options = (keys ?? [property]).map((key) =>
          key.length > 1 ? `--${key}` : `-${key}`,
        );

        optionDescription.push({
          options,
          description,
        });
      }
    }
    return optionDescription;
  }

  public dumpAll(): DumpItem[] {
    return this.modules
      .map((module) => this.dumpModule(module))
      .flatMap((f) => f);
  }

  // public getScope(): ModuleData[] {
  //   return this.describeModule(this.scope.module);
  // }

  // private static formatType(
  //   type: string | null,
  //   itemType: string | null,
  // ): string {
  //   if (!type) {
  //     return '';
  //   } else if (['number', 'string'].includes(type)) {
  //     return `<${type}>`;
  //   } else if (type === 'array') {
  //     const subType =
  //       itemType && ['number', 'string'].includes(itemType) ? itemType : '';
  //     return `<...${subType}>`;
  //   }
  //   return '';
  // }

  public static formatActionDescription(
    optionDescription: OptionsData[],
    { showType = true }: { showType?: boolean } = {},
  ): string {
    let content = '';

    for (const { options, description } of optionDescription) {
      const col1 = options.join(', ') + ' ' + (showType ? '??' : '');
      content +=
        this.formatTwoCols([col1.trim(), description], {
          firstColLen: 22,
          indent: 4,
        }) + `\n`;
    }

    return content;
  }

  public static formatDump(
    dump: DumpItem[],
    { showOptions = true }: { showOptions?: boolean } = {},
  ): string {
    let content = '';

    // for (const dumpItem of dump) {
    //   const { command, description, optionDescription } = dumpItem;
    //   content +=
    //     this.formatTwoCols([command, description], {
    //       firstColLen: 24,
    //       indent: 2,
    //     }) + `\n`;

    //   if (showOptions && optionDescription.length > 0) {
    //     content += `\n`;
    //     content += this.formatActionDescription(optionDescription);
    //     content += `\n`;
    //   }
    // }

    return content;
  }

  public static formatTwoCols(
    row: [string, string],
    options: {
      firstColLen?: number;
      indent?: number;
      height?: number;
    } = {},
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
    { shift, height }: { shift: number; height: number },
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
