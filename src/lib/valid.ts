import { Validation } from '../types';
import { validations } from './validations';

type RuleName = keyof typeof validations;

export const valid = (ruleOrRules: RuleName | RuleName[]): Validation => {
  const rules = Array.isArray(ruleOrRules) ? ruleOrRules : [ruleOrRules];
  return (value) => rules.every((key) => validations[key](value));
};
