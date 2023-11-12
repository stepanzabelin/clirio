import { ArgMetadata } from '../classes';
import { helperArgMetadata } from '../metadata';
import { InputTypeEnum } from '../types';

export const Helper = function () {
  return function (target: object, propertyName: string, argIndex: number) {
    const entity = ArgMetadata.extractEntity(target, propertyName, argIndex);

    helperArgMetadata.setArgData(target, propertyName, argIndex, {
      entity,
      type: InputTypeEnum.helper,
    });
  };
};
