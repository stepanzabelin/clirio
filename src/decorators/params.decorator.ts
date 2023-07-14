import { ArgMetadata } from '../lib/ArgMetadata';
import { paramsArgMetadata } from '../metadata';
import { Constructor, InputTypeEnum } from '../types';

export const Params = function () {
  return function (
    target: Constructor<any>,
    propertyName: string,
    argIndex: number,
  ) {
    const dto = ArgMetadata.extractDto(target, propertyName, argIndex);

    paramsArgMetadata.setArgData(target, propertyName, argIndex, {
      dto,
      type: InputTypeEnum.Params,
    });
  };
};
