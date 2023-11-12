import {
  commandTargetMetadata,
  moduleEntityMetadata,
  optionTargetMetadata,
  optionsArgMetadata,
  paramsArgMetadata,
  paramTargetMetadata,
  envTargetMetadata,
  envsArgMetadata,
} from '../metadata';
import { Constructor, DataTypeEnum } from '../types';
import { getPrototype, isConstructor } from '../utils';

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
  formattedInputKey: string;
  keys: string[];
  propertyName: string;
  description: string | null;
  hidden: boolean;
};

type Input = {
  type: DataTypeEnum;
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
  private readonly scopedModule: Constructor<any>;
  private readonly scopedActionName: string;

  constructor({
    modules,
    scopedModule,
    scopedActionName,
  }: {
    scopedModule: Constructor<any>;
    modules: Constructor<any>[];
    scopedActionName: string;
  }) {
    this.modules = modules;
    this.scopedActionName = scopedActionName;
    this.scopedModule = scopedModule;
  }

  public dumpModule(module: Constructor<any>): DumpItem[] {
    const moduleData = moduleEntityMetadata.get(getPrototype(module))!;
    const commandMap = commandTargetMetadata.getMap(getPrototype(module));
    const results: DumpItem[] = [];

    for (const [propertyKey, commandData] of commandMap) {
      const envsArgMap = envsArgMetadata.getArgMap(
        getPrototype(module),
        propertyKey,
      );

      const paramsArgMap = paramsArgMetadata.getArgMap(
        getPrototype(module),
        propertyKey,
      );

      const optionsArgMap = optionsArgMetadata.getArgMap(
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
          command: commandData.command,
          description: commandData.description,
          hidden: commandData.hidden,
        },
        inputs: [
          ...[...envsArgMap.values()].map((data) => {
            return {
              type: DataTypeEnum.envs,
              entity: isConstructor(data.entity) ? data.entity : null,
              fields: ClirioHelper.dumpInputEnvs(data.entity),
            };
          }),
          ...[...paramsArgMap.values()].map((data) => {
            return {
              type: DataTypeEnum.params,
              entity: isConstructor(data.entity) ? data.entity : null,
              fields: ClirioHelper.dumpInputParams(data.entity),
            };
          }),
          ...[...optionsArgMap.values()].map((data) => {
            return {
              type: DataTypeEnum.options,
              entity: isConstructor(data.entity) ? data.entity : null,
              fields: ClirioHelper.dumpInputOptions(data.entity),
            };
          }),
        ],
      });
    }

    return results;
  }

  public static dumpInputEnvs(entity: Constructor<any>): Field[] {
    return [...envTargetMetadata.getMap(getPrototype(entity))].map(
      ([propertyName, data]) => ({
        formattedInputKey: this.getFormattedEnvKey(entity, propertyName)!,
        propertyName,
        keys: data.key ? [data.key] : [],
        description: data.description,
        hidden: data.hidden,
      }),
    );
  }

  public static dumpInputParams(entity: Constructor<any>): Field[] {
    return [...paramTargetMetadata.getMap(getPrototype(entity))].map(
      ([propertyName, data]) => ({
        formattedInputKey: this.getFormattedParamKey(entity, propertyName)!,
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
        formattedInputKey: this.getFormattedOptionKey(entity, propertyName)!,
        propertyName,
        keys: data.keys ?? [propertyName],
        description: data.description,
        hidden: data.hidden,
      }),
    );
  }

  public static getFormattedInputKey(
    entity: Constructor<any>,
    type: DataTypeEnum,
    propertyName: string,
  ) {
    switch (type) {
      case DataTypeEnum.envs:
        return this.getFormattedEnvKey(entity, propertyName);
      case DataTypeEnum.params:
        return this.getFormattedParamKey(entity, propertyName);
      case DataTypeEnum.options:
        return this.getFormattedOptionKey(entity, propertyName);
      default:
        return null;
    }
  }

  static getFormattedEnvKey(
    entity: Constructor<any>,
    propertyName: string,
  ): string | null {
    const data = envTargetMetadata.getData(entity.prototype, propertyName);

    if (!data) {
      return null;
    }

    return this.formatEnvKey(data.key ?? propertyName);
  }

  public static getFormattedParamKey(
    entity: Constructor<any>,
    propertyName: string,
  ): string | null {
    const data = paramTargetMetadata.getData(entity.prototype, propertyName);

    if (!data) {
      return null;
    }

    return this.formatParamKey(data.key ?? propertyName);
  }

  public static getFormattedOptionKey(
    entity: Constructor<any>,
    propertyName: string,
  ): string | null {
    const data = optionTargetMetadata.getData(entity.prototype, propertyName);

    if (!data) {
      return null;
    }

    return (data.keys ?? [propertyName])
      .map((key) => this.formatOptionKey(key))
      .join(', ');
  }

  public static formatEnvKey(key: string): string {
    return '$ ' + key;
  }

  public static formatParamKey(key: string): string {
    return '<' + key + '>';
  }

  public static formatOptionKey(key: string): string {
    return key.length > 1 ? `--${key}` : `-${key}`;
  }

  public dumpAll(): DumpItem[] {
    return this.modules
      .map((module) => this.dumpModule(module))
      .flatMap((f) => f);
  }

  public dumpThisModule(): DumpItem[] {
    return this.dumpModule(this.scopedModule);
  }

  public static formatDump(
    dump: DumpItem[],
    {
      displayEnvs = true,
      displayParams = true,
      displayOptions = true,
    }: {
      displayEnvs?: boolean;
      displayParams?: boolean;
      displayOptions?: boolean;
    } = {},
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

      const list: Input[][] = [];

      if (displayParams) {
        list.push(
          dumpItem.inputs.filter((input) => input.type === DataTypeEnum.params),
        );
      }

      if (displayOptions) {
        list.push(
          dumpItem.inputs.filter(
            (input) => input.type === DataTypeEnum.options,
          ),
        );
      }

      if (displayEnvs) {
        list.push(
          dumpItem.inputs.filter((input) => input.type === DataTypeEnum.envs),
        );
      }

      for (const inputs of list) {
        for (const input of inputs) {
          for (const field of input.fields) {
            if (field.hidden) {
              continue;
            }
            content +=
              this.formatColumns(
                [field.formattedInputKey, field.description ?? ''],
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
      [command, dumpItem.action.description ?? ''],
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
