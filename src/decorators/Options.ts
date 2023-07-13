import { ArgMetadata } from '../lib/ArgMetadata'
import { optionsArgMetadata } from '../metadata'
import { Constructor, InputTypeEnum } from '../types'

export const Options = function () {
  return function (target: Constructor<any>, propertyName: string, argIndex: number) {
    const dto = ArgMetadata.extractDto(target, propertyName, argIndex)

    optionsArgMetadata.setArgData(target, propertyName, argIndex, {
      dto,
      type: InputTypeEnum.Options,
    })
  }
}
