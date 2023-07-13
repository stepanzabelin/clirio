import { transformTargetMetadata } from '../metadata'
import { TypedPropertyDecorator, Constructor } from '../types'

export const Transform = function <Type extends any>(transform: (value: string | null) => Type) {
  return function (target: Constructor<any>['prototype'], propertyName: string) {
    transformTargetMetadata.setData(target, propertyName, {
      transform,
    })
  } as TypedPropertyDecorator<Type>
}
