import { keyValueReg } from '../constrains/regexp.config';
import { Validation } from '../types';
import { isNumber, isString } from './typeValidations';

type Validator = { [key: string]: Validation };

export const VALIDATOR: Validator = {
  OPTIONAL: (value: any) => {
    return value === undefined ? true : null;
  },

  REQUIRED: (value: any) => {
    console.log('value', value);

    return value === undefined ? false : null;
  },

  NULLABLE: (value: any) => {
    return value === null ? true : null;
  },

  LOGICAL: (value: any) => {
    return [null, 'true', 'false'].includes(String(value));
  },

  KEY_VALUE: (values: any) => {
    return (
      Array.isArray(values) &&
      values.every((value) => value && value.match(keyValueReg))
    );
  },

  NUMBER: (value: any) => {
    return isNumber(value) || isString(Number(value));
  },

  STRING: (value: any) => {
    return isString(Number(value));
  },

  BOOLEAN: (value: any) => {
    return ['true', 'false'].includes(String(value));
  },
};
