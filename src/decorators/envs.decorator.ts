import { ArgMetadata } from '../classes';
import { envsArgMetadata } from '../metadata';
import { InputTypeEnum } from '../types';

export const Envs = function () {
  return function (target: object, propertyName: string, argIndex: number) {
    const entity = ArgMetadata.extractEntity(target, propertyName, argIndex);

    envsArgMetadata.setArgData(target, propertyName, argIndex, {
      entity,
      type: InputTypeEnum.Envs,
    });
  };
};
