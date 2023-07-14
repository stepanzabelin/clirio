import { descriptionTargetMetadata } from '../metadata';
import { Constructor } from '../types';

export const Description = function (description: string) {
  return function (target: Constructor<any>['prototype'], propertyKey: string) {
    descriptionTargetMetadata.setData(target, propertyKey, { description });
  };
};
