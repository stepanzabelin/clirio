import { ArgMetadata } from '../lib/ArgMetadata';
import { inputArgMetadata, optionsArgMetadata } from '../metadata';
import { Constructor, InputTypeEnum } from '../types';

export const Options = function () {
  return function (
    target: Constructor,
    propertyName: string,
    argIndex: number
  ) {
    inputArgMetadata.define(
      target,
      propertyName,
      argIndex,
      InputTypeEnum.Options
    );

    const dto = ArgMetadata.extractDto(target, propertyName, argIndex);

    optionsArgMetadata.setArgData(target, propertyName, argIndex, {
      dto,
      type: InputTypeEnum.Options,
    });
  };
};
