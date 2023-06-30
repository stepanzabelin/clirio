import { ArgMetadata } from '../lib/ArgMetadata';
import { inputArgMetadata, paramsArgMetadata } from '../metadata';
import { Constructor, InputTypeEnum } from '../types';

export const Params = function () {
  return function (
    target: Constructor,
    propertyName: string,
    argIndex: number
  ) {
    inputArgMetadata.define(
      target,
      propertyName,
      argIndex,
      InputTypeEnum.Params
    );

    const dto = ArgMetadata.extractDto(target, propertyName, argIndex);

    paramsArgMetadata.setArgData(target, propertyName, argIndex, {
      dto,
      type: InputTypeEnum.Params,
    });
  };
};
