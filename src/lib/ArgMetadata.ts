import { Constructor } from '../types'

export class ArgMetadata<Data extends Record<string, unknown>> {
  private readonly metadataSymbol: symbol

  constructor(metadataKey: string) {
    this.metadataSymbol = Symbol(metadataKey)
  }

  getArgDataField<F extends keyof Data>(
    target: Constructor<any>['prototype'],
    propertyName: string,
    argIndex: number,
    field: F
  ): Data[F] | undefined {
    return this.getArgData(target, propertyName, argIndex)?.[field]
  }

  getArgData(target: Constructor<any>['prototype'], propertyName: string, argIndex: number) {
    return this.getArgMap(target, propertyName).get(argIndex)
  }

  hasArgData(target: Constructor<any>['prototype'], propertyName: string, argIndex: number) {
    return this.getArgMap(target, propertyName).has(argIndex)
  }

  setArgData(
    target: Constructor<any>['prototype'],
    propertyName: string,
    argIndex: number,
    data: Data
  ) {
    const argMap = this.getArgMap(target, propertyName)
    argMap.set(argIndex, data)
    this.setArgMap(target, propertyName, argMap)
  }

  setArgMap(
    target: Constructor<any>['prototype'],
    propertyName: string,
    argMap: Map<number, Data>
  ) {
    const propMap = this.getPropMap(target)
    propMap.set(propertyName, argMap)
    this.setPropMap(target, propMap)
  }

  getArgMap(target: Constructor<any>['prototype'], propertyName: string) {
    return this.getPropMap(target).get(propertyName) ?? new Map<number, Data>()
  }

  setPropMap(target: Constructor<any>['prototype'], propMap: Map<string, Map<number, Data>>) {
    Reflect.defineMetadata(this.metadataSymbol, propMap, target)
  }

  getPropMap(target: Constructor<any>['prototype']): Map<string, Map<number, Data>> {
    return Reflect.getMetadata(this.metadataSymbol, target) ?? new Map<string, Map<number, Data>>()
  }

  has(target: Constructor<any>['prototype']): boolean {
    return Reflect.hasMetadata(this.metadataSymbol, target)
  }

  public static extractDto(
    target: Constructor<any>['prototype'],
    propertyName: string,
    argIndex: number
  ): Constructor<any> {
    const paramTypes: Constructor<any>[] =
      Reflect.getMetadata('design:paramtypes', target, propertyName) ?? []
    return paramTypes[argIndex]
  }
}
