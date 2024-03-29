import { Constructor } from '../types';

export const isConstructor = (entity: any): boolean => {
  return Boolean(entity) && entity !== Object && typeof entity === 'function';
};

export const getPrototype = (
  entity: Constructor<any> | Constructor<any>['prototype'],
) => {
  return typeof entity === 'function'
    ? entity.prototype
    : entity.constructor.prototype;
};

export const getInstance = (
  entity: Constructor<any> | Constructor<any>['prototype'],
) => {
  return typeof entity === 'function' ? new entity() : entity;
};
