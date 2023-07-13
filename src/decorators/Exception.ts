import { exceptionTargetMetadata } from '../metadata'
import { Constructor, ExceptionTargetData } from '../types'

export const Exception = function (
  exception: ExceptionTargetData['exception'],
  { overwriteGlobal = false }: Partial<Omit<ExceptionTargetData, 'exception'>> = {}
) {
  return function (target: Constructor<any>['prototype'], propertyKey: string) {
    exceptionTargetMetadata.setData(target, propertyKey, {
      exception,
      overwriteGlobal,
    })
  }
}
