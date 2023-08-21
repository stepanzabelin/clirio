import { ArgMetadata } from '../classes';
import { optionsArgMetadata } from '../metadata';
import { InputTypeEnum } from '../types';

export const Options = function () {
  return function (target: object, propertyName: string, argIndex: number) {
    const entity = ArgMetadata.extractEntity(target, propertyName, argIndex);

    optionsArgMetadata.setArgData(target, propertyName, argIndex, {
      entity,
      type: InputTypeEnum.Options,
    });
  };
};
