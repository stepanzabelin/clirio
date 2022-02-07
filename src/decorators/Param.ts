import { md } from '../metadata';
import { Constructor } from '../types';

export const Param = function (paramName: string | null = null) {
  return function (target: Constructor['prototype'], propertyName: string) {
    md.param.merge(target, propertyName, {
      paramName,
    });
  };
};
