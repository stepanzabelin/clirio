import { ArgMetadata } from '../classes';
import { paramsArgMetadata } from '../metadata';
import { InputTypeEnum } from '../types';

export const Params = function () {
  return function (target: object, propertyName: string, argIndex: number) {
    const entity = ArgMetadata.extractEntity(target, propertyName, argIndex);

    paramsArgMetadata.setArgData(target, propertyName, argIndex, {
      entity,
      type: InputTypeEnum.params,
    });
  };
};
