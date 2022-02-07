import { md } from '../metadata';
import { Constructor } from '../types';

export const Description = function (description: string) {
  return function (target: Constructor['prototype'], propertyKey: string) {
    md.help.mergeParam(target, propertyKey, 'description', description);
  };
};
