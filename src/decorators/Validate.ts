import { validateTargetMetadata } from '../metadata';
import { Constructor, ValidateTargetData } from '../types';

export const Validate = function (
  checkOrChecks:
    | ValidateTargetData['checks'][number]
    | ValidateTargetData['checks']
) {
  return function (target: Constructor['prototype'], propertyName: string) {
    validateTargetMetadata.setData(target, propertyName, {
      checks: Array.isArray(checkOrChecks) ? checkOrChecks : [checkOrChecks],
    });
  };
};
