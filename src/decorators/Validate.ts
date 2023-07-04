import { validateTargetMetadata } from '../metadata';
import { Constructor, ValidateTargetData } from '../types';

export const Validate = function (
  ruleOrRules: ValidateTargetData['rules'][number] | ValidateTargetData['rules']
) {
  return function (target: Constructor['prototype'], propertyName: string) {
    validateTargetMetadata.setData(target, propertyName, {
      rules: Array.isArray(ruleOrRules) ? ruleOrRules : [ruleOrRules],
    });
  };
};
