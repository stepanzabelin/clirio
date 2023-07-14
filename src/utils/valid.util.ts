import { Validation } from '../types';
import { validations } from './validations.util';

type CheckName = keyof typeof validations;

export const valid = (checkOrChecks: CheckName | CheckName[]): Validation => {
  const checks = Array.isArray(checkOrChecks) ? checkOrChecks : [checkOrChecks];
  return (value) => checks.every((key) => validations[key](value));
};
