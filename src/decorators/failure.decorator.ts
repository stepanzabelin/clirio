import { Constructor } from '../types';
import { failureTargetMetadata } from '../metadata';

export const Failure = function () {
  return function (target: Constructor<any>['prototype'], propertyKey: string) {
    failureTargetMetadata.setData(target, propertyKey, {});
  };
};
