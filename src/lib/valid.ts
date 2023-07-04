import { Validation } from '../types';
import { VALIDATOR } from './VALIDATOR';

type RuleName = keyof typeof VALIDATOR;

export const valid = (ruleOrRules: RuleName | RuleName[]): Validation => {
  const rules = Array.isArray(ruleOrRules) ? ruleOrRules : [ruleOrRules];
  return (value) => rules.every((key) => VALIDATOR[key](value));
};
