import { ActionType, Constructor, Link } from '../../types';

const METADATA_ACTION_KEY = Symbol('action');

export type ActionMetadataData = {
  links: Link[];
  command: string | null;
  type: ActionType;
};

export const actionMetadata = {
  set(target: Constructor['prototype'], map: Map<string, ActionMetadataData>) {
    Reflect.defineMetadata(METADATA_ACTION_KEY, map, target);
  },

  get(target: Constructor['prototype']): Map<string, ActionMetadataData> {
    return Reflect.getOwnMetadata(METADATA_ACTION_KEY, target) || new Map();
  },

  has(target: Constructor['prototype']) {
    return Reflect.hasOwnMetadata(METADATA_ACTION_KEY, target);
  },

  setData(
    target: Constructor['prototype'],
    propertyKey: string,
    data: ActionMetadataData
  ) {
    const map = this.get(target);
    map.set(propertyKey, data);
    this.set(target, map);
  },
};
