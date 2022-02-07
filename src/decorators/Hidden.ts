import { md } from '../metadata';
import { Constructor } from '../types';

export const Hidden = function (hidden = true) {
  return function (target: Constructor['prototype'], propertyKey: string) {
    md.help.mergeParam(target, propertyKey, 'hidden', hidden);
  };
};
