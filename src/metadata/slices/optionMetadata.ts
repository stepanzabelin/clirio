export const METADATA_OPTION_KEY = Symbol('option');
import { Constructor } from '../../types';

export type OptionMetadataData = {
  aliases: null | string[];
  isArray: boolean;
  nullableValue: undefined | any;
  variable: boolean;
};

export const optionMetadata = {
  merge(
    target: Constructor['prototype'],
    propertyName: string,
    data: OptionMetadataData
  ) {
    const map = this.get(target);
    map.set(propertyName, data);
    this.set(target, map);
  },

  set(target: Constructor['prototype'], map: Map<string, OptionMetadataData>) {
    Reflect.defineMetadata(METADATA_OPTION_KEY, map, target);
  },

  get(target: Constructor['prototype']): Map<string, OptionMetadataData> {
    return Reflect.getMetadata(METADATA_OPTION_KEY, target) ?? new Map();
  },
};
