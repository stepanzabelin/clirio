import { paramTargetMetadata } from '../metadata';
import { Constructor } from '../types';

export const Param = function (paramName: string | null = null) {
  return function (target: Constructor['prototype'], propertyName: string) {
    paramTargetMetadata.setData(target, propertyName, {
      paramName,
      isArray: false,
      // TODO ? array
    });
  };
};
