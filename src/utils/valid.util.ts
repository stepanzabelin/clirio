import { Validation } from '../types';
import { validations } from './validations.util';

type CheckName = keyof typeof validations;

export type ValidArg1 = CheckName | CheckName[];
export type Valid = (checkOrChecks: ValidArg1) => Validation[];

export const valid = (checkOrChecks: ValidArg1): Validation[] => {
  const checks = Array.isArray(checkOrChecks) ? checkOrChecks : [checkOrChecks];
  return checks.map((key) => validations[key]);

  // return (value) =>
  //   checks
  //     .every((key) => validations[key](value) !== false)
  //     .some((key) => validations[key](value));
};
