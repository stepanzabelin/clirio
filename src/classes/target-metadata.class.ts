import { Constructor } from '../types';

export class TargetMetadata<Data extends Record<string, unknown>> {
  private readonly metadataSymbol: symbol;

  constructor(metadataKey: string) {
    this.metadataSymbol = Symbol(metadataKey);
  }

  setData(
    target: Constructor<any>['prototype'],
    propertyName: string,
    data: Data,
  ) {
    const map = this.getMap(target);
    map.set(propertyName, data);
    this.setMap(target, map);
  }

  getData(target: Constructor<any>['prototype'], propertyName: string) {
    return this.getMap(target).get(propertyName);
  }

  getDataField<F extends keyof Data>(
    target: Constructor<any>['prototype'],
    propertyName: string,
    field: F,
  ): Data[F] | undefined {
    return this.getData(target, propertyName)?.[field];
  }

  setMap(target: Constructor<any>['prototype'], map: Map<string, Data>) {
    Reflect.defineMetadata(this.metadataSymbol, map, target);
  }

  getMap(target: Constructor<any>['prototype']): Map<string, Data> {
    return Reflect.getMetadata(this.metadataSymbol, target) ?? new Map();
  }

  has(target: Constructor<any>['prototype']): boolean {
    return Reflect.hasMetadata(this.metadataSymbol, target);
  }
}
