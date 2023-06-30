import { validateTargetMetadata } from '../metadata';
import { Constructor } from '../types';

export const Validate = function (
  validate: (data: string | null) => boolean | never
) {
  return function (target: Constructor['prototype'], propertyName: string) {
    validateTargetMetadata.setData(target, propertyName, {
      validate,
    });
  };
};
