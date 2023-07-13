import { hiddenTargetMetadata } from '../metadata'
import { Constructor } from '../types'

export const Hidden = function (hidden = true) {
  return function (target: Constructor<any>['prototype'], propertyKey: string) {
    hiddenTargetMetadata.setData(target, propertyKey, { hidden })
  }
}
