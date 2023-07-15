import { keyValueReg } from '../constrains';
import { Validation } from '../types';
import { isBoolean, isNumber, isString } from './type-validations.util';

type Validations = { [key: string]: Validation };

export const validations: Validations = {
  OPTIONAL: (value: any) => {
    return value === undefined ? true : null;
  },

  REQUIRED: (value: any) => {
    return value === undefined ? false : null;
  },

  NULLABLE: (value: any) => {
    return value === null ? true : null;
  },

  NULL: (value: any) => {
    return value === null;
  },

  NUMBER: (value: any) => {
    return isNumber(value) || (isString(value) && isNumber(Number(value)));
  },

  INTEGER: (value: any) => {
    return isNumber(value) && Number.isInteger(Number(value));
  },

  STRING: (value: any) => {
    return isString(value);
  },

  BOOLEAN: (value: any) => {
    return isBoolean(value) || ['true', 'false'].includes(String(value));
  },

  FLAG: (value: any) => {
    return [null, 'true', 'false'].includes(value);
  },

  KEY_VALUE: (values: any) => {
    return (
      Array.isArray(values) &&
      values.every((value) => value && value.match(keyValueReg))
    );
  },
};
