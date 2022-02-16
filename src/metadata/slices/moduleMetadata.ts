export const METADATA_MODULE_KEY = Symbol('module');
import { Constructor, Link } from '../../types';

export type ModuleMetadataData = {
  command: string | null;
  links: Link[];
};

const initialData = {
  command: null,
  links: [],
};

export const moduleMetadata = {
  set(target: Constructor['prototype'], data: ModuleMetadataData) {
    Reflect.defineMetadata(METADATA_MODULE_KEY, data, target);
  },

  get(target: Constructor['prototype']): ModuleMetadataData | undefined {
    return Reflect.getMetadata(METADATA_MODULE_KEY, target);
  },

  has(target: Constructor['prototype']): boolean {
    return Reflect.hasMetadata(METADATA_MODULE_KEY, target);
  },

  merge<Key extends keyof ModuleMetadataData>(
    target: Constructor['prototype'],
    key: Key,
    value: ModuleMetadataData[Key]
  ) {
    const data = this.get(target) ?? initialData;
    this.set(target, { ...data, [key]: value });
  },
};
