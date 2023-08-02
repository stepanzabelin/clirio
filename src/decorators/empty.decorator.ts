import { Constructor } from '../types';
import { emptyTargetMetadata } from '../metadata';

export const Empty = function () {
  return function (target: Constructor<any>['prototype'], propertyKey: string) {
    emptyTargetMetadata.setData(target, propertyKey, {});
  };
};
