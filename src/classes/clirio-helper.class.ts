import {
  actionTargetMetadata,
  moduleEntityMetadata,
  optionTargetMetadata,
  optionsArgMetadata,
  paramsArgMetadata,
  paramTargetMetadata,
} from '../metadata';
import { ActionType, Constructor } from '../types';
import { getPrototype, isEntity } from '../utils';

type ModuleData = {
  entity: Constructor<any>;
  command: string | null;
  description: string | null;
  hidden: boolean;
};

type ActionData = {
  name: string;
  command: string;
  description: string | null;
  hidden: boolean;
};

type Field = {
  keys: string[];
  propertyName: string;
  description: string | null;
  hidden: boolean;
};

type DataType = 'params' | 'options';

type Input = {
  type: DataType;
  entity: Constructor<any> | null;
  fields: Field[];
};

type DumpItem = {
  module: ModuleData;
  action: ActionData;
  inputs: Input[];
};

type FormatOptions = {
  firstColLen: number;
  indent: number;
  height: number;
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

      const optionsArgMap = optionsArgMetadata.getArgMap(
        getPrototype(module),
        propertyKey,
      );

      const paramsArgMap = paramsArgMetadata.getArgMap(
        getPrototype(module),
        propertyKey,
      );

      results.push({
        module: {
          entity: getPrototype(module),
          command: moduleData.command,
          description: moduleData.description,
          hidden: moduleData.hidden,
        },
        action: {
          name: propertyKey,
          command: actionData.command,
          description: actionData.description,
          hidden: actionData.hidden,
        },
        inputs: [
          ...[...paramsArgMap.values()].map((data) => {
            return {
              type: 'params' as DataType,
              entity: isEntity(data.entity) ? data.entity : null,
              fields: ClirioHelper.dumpInputParams(data.entity),
            };
          }),
          ...[...optionsArgMap.values()].map((data) => {
            return {
              type: 'options' as DataType,
              entity: isEntity(data.entity) ? data.entity : null,
              fields: ClirioHelper.dumpInputOptions(data.entity),
            };
          }),
        ],
      });
    }

    return results;
  }

  public static dumpInputParams(entity: Constructor<any>): Field[] {
    return [...paramTargetMetadata.getMap(getPrototype(entity))].map(
      ([propertyName, data]) => ({
        propertyName,
        keys: data.key ? [data.key] : [],
        description: data.description,
        hidden: data.hidden,
      }),
    );
  }

  public static dumpInputOptions(entity: Constructor<any>): Field[] {
    return [...optionTargetMetadata.getMap(getPrototype(entity))].map(
      ([propertyName, data]) => ({
        propertyName,
        keys: data.keys ?? [],
        description: data.description,
        hidden: data.hidden,
      }),
    );
  }

  public static formatOptionField(field: Field): string {
    const keys = field.keys.length > 0 ? field.keys : [field.propertyName];
    return keys
      .map((key) => (key.length > 1 ? `--${key}` : `-${key}`))
      .join(', ');
  }

  public static formatParamField(field: Field): string {
    const keys = field.keys.length > 0 ? field.keys : [field.propertyName];
    return '<' + keys.join(', ') + '>';
  }

  public dumpAll(): DumpItem[] {
    return this.modules
      .map((module) => this.dumpModule(module))
      .flatMap((f) => f);
  }

  public static formatDump(
    dump: DumpItem[],
    { showParams = false }: { showParams?: boolean } = {},
  ): string {
    let content = '';

    for (const dumpItem of dump) {
      if (dumpItem.module.hidden) {
        continue;
      }

      if (dumpItem.action.hidden) {
        continue;
      }

      content +=
        this.formatCommand(dumpItem, {
          firstColLen: 24,
          indent: 2,
        }) + `\n`;

      if (showParams) {
        for (const input of dumpItem.inputs) {
          if (input.type === 'params') {
            for (const field of input.fields) {
              if (field.hidden) {
                continue;
              }
              content +=
                this.formatColumns(
                  [this.formatParamField(field), field.description ?? ''],
                  {
                    firstColLen: 24,
                    indent: 4,
                  },
                ) + `\n`;
            }
          }
        }
      }

      for (const input of dumpItem.inputs) {
        if (input.type === 'options') {
          for (const field of input.fields) {
            content +=
              this.formatColumns(
                [this.formatOptionField(field), field.description ?? ''],
                {
                  firstColLen: 24,
                  indent: 4,
                },
              ) + `\n`;
          }
        }
      }

      content += `\n`;
    }

    return content;
  }

  public static formatCommand(
    dumpItem: DumpItem,
    formatOptions: Partial<FormatOptions> = {},
  ): string {
    const command = [dumpItem.module.command, dumpItem.action.command]
      .filter((f) => f)
      .join(' ');

    return this.formatColumns(
      [command, dumpItem.module.description ?? ''],
      formatOptions,
    );
  }

  public static formatColumns(
    row: [string, string],
    { firstColLen = 24, indent = 2, height = 80 }: Partial<FormatOptions> = {},
  ): string {
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
