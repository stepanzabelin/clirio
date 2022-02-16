import { Constructor } from '../../types';

const METADATA_DATA_KEY = Symbol('help');

type helpData = {
  description: string;
  hidden: boolean;
};

const initialData: helpData = {
  description: '',
  hidden: false,
};

export const helpMetadata = {
  set(target: Constructor['prototype'], map: Map<string, helpData>) {
    Reflect.defineMetadata(METADATA_DATA_KEY, map, target);
  },

  get(target: Constructor['prototype']): Map<string, helpData> {
    return Reflect.getMetadata(METADATA_DATA_KEY, target) || new Map();
  },

  has(target: Constructor['prototype']) {
    return Reflect.hasMetadata(METADATA_DATA_KEY, target);
  },

  mergeParam<Key extends keyof helpData>(
    target: Constructor['prototype'],
    propertyKey: string,
    key: Key,
    value: helpData[Key]
  ) {
    const data = this.getData(target, propertyKey);
    data[key] = value;
    this.setData(target, propertyKey, data);
  },

  setData(
    target: Constructor['prototype'],
    propertyKey: string,
    data: helpData
  ) {
    const dataMap = this.get(target);
    dataMap.set(propertyKey, data);
    this.set(target, dataMap);
  },

  getData(target: Constructor['prototype'], propertyKey: string): helpData {
    const dataMap = this.get(target);
    const data = dataMap.get(propertyKey) ?? { ...initialData };
    return data;
  },
};
