import { ArgMetadata } from '../classes';
import { optionsArgMetadata } from '../metadata';
import { Constructor, InputTypeEnum } from '../types';

export const Options = function () {
  return function (
    target: Constructor<any>,
    propertyName: string,
    argIndex: number,
  ) {
    const entity = ArgMetadata.extractEntity(target, propertyName, argIndex);

    optionsArgMetadata.setArgData(target, propertyName, argIndex, {
      entity,
      type: InputTypeEnum.Options,
    });
  };
};
