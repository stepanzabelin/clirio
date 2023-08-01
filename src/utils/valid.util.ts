import { keyValueReg } from '../constrains';
import { Check } from '../types';
import { isBoolean, isNumber, isString } from './type-checks.util';

export const valid = {
  OPTIONAL: (value: any): ReturnType<Check> => {
    return value === undefined || null;
  },

  REQUIRED: (value: any): ReturnType<Check> => {
    return value === undefined && null;
  },

  NULLABLE: (value: any): ReturnType<Check> => {
    return value === null || null;
  },

  NULL: (value: any): ReturnType<Check> => {
    return value === null;
  },

  NUMBER: (value: any): ReturnType<Check> => {
    return isNumber(value) || (isString(value) && isNumber(Number(value)));
  },

  INTEGER: (value: any): ReturnType<Check> => {
    return isNumber(value) && Number.isInteger(Number(value));
  },

  STRING: (value: any): ReturnType<Check> => {
    return isString(value);
  },

  BOOLEAN: (value: any): ReturnType<Check> => {
    return isBoolean(value) || ['true', 'false'].includes(String(value));
  },

  FLAG: (value: any): ReturnType<Check> => {
    return [null, 'true', 'false'].includes(value);
  },

  KEY_VALUE: (value: string | null | (string | null)[]): ReturnType<Check> => {
    const values = Array.isArray(value) ? value : [value];
    return values.every((value) => String(value).match(keyValueReg));
  },
};
