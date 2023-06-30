import { ArgMetadata } from '../lib/ArgMetadata';
import { helperArgMetadata, inputArgMetadata } from '../metadata';
import { Constructor, InputTypeEnum } from '../types';

export const Helper = function () {
  return function (
    target: Constructor,
    propertyName: string,
    argIndex: number
  ) {
    inputArgMetadata.define(
      target,
      propertyName,
      argIndex,
      InputTypeEnum.Helper
    );

    const dto = ArgMetadata.extractDto(target, propertyName, argIndex);

    helperArgMetadata.setArgData(target, propertyName, argIndex, {
      dto,
      type: InputTypeEnum.Helper,
    });
  };
};
