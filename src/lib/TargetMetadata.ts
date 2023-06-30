import { Constructor } from '../types';

export class TargetMetadata<Data extends Record<string, unknown>> {
  private readonly metadataSymbol: symbol;

  constructor(metadataKey: string) {
    this.metadataSymbol = Symbol(metadataKey);
  }

  setData(target: Constructor['prototype'], propertyName: string, data: Data) {
    const map = this.getMap(target);
    map.set(propertyName, data);
    this.setMap(target, map);
  }

  // mergeData(
  //   target: Constructor['prototype'],
  //   propertyName: string,
  //   data: Partial<Data>
  // ) {
  //   const map = this.getMap(target);
  //   const oldData: Partial<Data> = map.get(propertyName) ?? this.defaultData;
  //   map.set(propertyName, { ...oldData, ...data });
  //   this.setMap(target, map);
  // }

  getData(target: Constructor['prototype'], propertyName: string) {
    return this.getMap(target).get(propertyName);
  }

  getDataField<F extends keyof Data>(
    target: Constructor['prototype'],
    propertyName: string,
    field: F
  ): Data[F] | undefined {
    return this.getData(target, propertyName)?.[field];
  }

  setMap(target: Constructor['prototype'], map: Map<string, Data>) {
    Reflect.defineMetadata(this.metadataSymbol, map, target);
  }

  getMap(target: Constructor['prototype']): Map<string, Data> {
    return Reflect.getMetadata(this.metadataSymbol, target) ?? new Map();
  }

  has(target: Constructor['prototype']): boolean {
    return Reflect.hasMetadata(this.metadataSymbol, target);
  }
}
