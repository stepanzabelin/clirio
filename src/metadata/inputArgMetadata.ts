export const METADATA_INPUT_KEY = Symbol('input');
import { Constructor, InputTypeEnum } from '../types';

export type InputMetadataData = {
  type: InputTypeEnum;
  dto: Constructor;
};

export const inputArgMetadata = {
  define(
    target: Constructor['prototype'],
    propertyName: string,
    argIndex: number,
    type: InputMetadataData['type']
  ) {
    const paramTypes: Constructor[] =
      Reflect.getMetadata('design:paramtypes', target, propertyName) ?? [];

    inputArgMetadata.merge(target, propertyName, argIndex, {
      type,
      dto: paramTypes[argIndex],
    });
  },

  merge(
    target: Constructor['prototype'],
    propertyName: string,
    inputIndex: number,
    data: InputMetadataData
  ) {
    const map = this.get(target, propertyName);
    map.set(inputIndex, data);
    this.set(target, propertyName, map);
  },

  set(
    target: Constructor['prototype'],
    propertyName: string,
    map: Map<number, InputMetadataData>
  ) {
    Reflect.defineMetadata(METADATA_INPUT_KEY, map, target, propertyName);
  },

  get(
    target: Constructor['prototype'],
    propertyName: string
  ): Map<number, InputMetadataData> {
    return (
      Reflect.getMetadata(METADATA_INPUT_KEY, target, propertyName) ?? new Map()
    );
  },
};
