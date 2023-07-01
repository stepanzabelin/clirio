import { Constructor } from '../types';

export class EntityMetadata<Data extends Record<string, unknown>> {
  private readonly metadataSymbol: symbol;

  constructor(metadataKey: string) {
    this.metadataSymbol = Symbol(metadataKey);
  }

  set(target: Constructor['prototype'], data: Data) {
    Reflect.defineMetadata(this.metadataSymbol, data, target);
  }

  get(target: Constructor['prototype']): Data | undefined {
    return Reflect.getMetadata(this.metadataSymbol, target);
  }

  has(target: Constructor['prototype']): boolean {
    return Reflect.hasMetadata(this.metadataSymbol, target);
  }
}
