export const METADATA_PARAM_KEY = Symbol('param');

import { Constructor } from '../../types';

export type ParamMetadataData = {
  paramName: null | string;
};

export const paramMetadata = {
  merge(
    target: Constructor['prototype'],
    propertyName: string,
    data: ParamMetadataData
  ) {
    const map = this.get(target);
    map.set(propertyName, data);
    this.set(target, map);
  },

  set(target: Constructor['prototype'], map: Map<string, ParamMetadataData>) {
    Reflect.defineMetadata(METADATA_PARAM_KEY, map, target);
  },

  get(target: Constructor['prototype']): Map<string, ParamMetadataData> {
    return Reflect.getOwnMetadata(METADATA_PARAM_KEY, target) ?? new Map();
  },
};
