import { keyValueReg } from '../constrains/regexp.config';

export const VALIDATE = {
  LOGICAL: (value: (string | null) | (string | null)[]): boolean => {
    return [null, 'true', 'false'].includes(String(value));
  },

  KEY_VALUE: (values: (string | null) | (string | null)[]): boolean => {
    return (
      Array.isArray(values) &&
      values.every((value) => value && value.match(keyValueReg))
    );
  },
};
