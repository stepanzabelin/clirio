import { ArgMetadata } from '../classes';
import { helperArgMetadata } from '../metadata';
import { Constructor, InputTypeEnum } from '../types';

export const Helper = function () {
  return function (
    target: Constructor<any>,
    propertyName: string,
    argIndex: number,
  ) {
    const dto = ArgMetadata.extractDto(target, propertyName, argIndex);

    helperArgMetadata.setArgData(target, propertyName, argIndex, {
      dto,
      type: InputTypeEnum.Helper,
    });
  };
};
