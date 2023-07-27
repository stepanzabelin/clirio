import { Validation } from '../types';
import { validations } from './validations.util';

type CheckName = keyof typeof validations;

export type ValidArg = CheckName | CheckName[];
export type Valid = (checkOrChecks: ValidArg) => Validation[];

export const valid = (checkOrChecks: ValidArg): Validation[] => {
  const checks = Array.isArray(checkOrChecks) ? checkOrChecks : [checkOrChecks];
  return checks.map((key) => validations[key]);
};
