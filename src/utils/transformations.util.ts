import { keyValueReg } from '../constrains';

export const transformations = {
  NUMBER: (value: any) => {
    return Number(value) || 0;
  },

  STRING: (value: any) => {
    return String(value ?? '');
  },

  BOOLEAN: (value: any) => {
    return Boolean(value);
  },

  FLAG: (value: string | null): boolean => {
    switch (true) {
      case value === null: {
        return true;
      }
      case value === 'true': {
        return true;
      }

      default:
        return false;
    }
  },

  KEY_VALUE: (
    value: string | null | (string | null)[],
  ): Record<string, string | null> => {
    const obj: Record<string, string | null> = {};

    const values = Array.isArray(value) ? value : [value];

    for (const value of values) {
      const matchVariable = String(value).match(keyValueReg);

      if (matchVariable) {
        const { key, value = null } = matchVariable.groups!;
        obj[key] = value;
      }
    }

    return obj;
  },

  ARRAY: (values: string | null | (string | null)[]) => {
    return Array.isArray(values) ? values : [values];
  },

  PLAIN: (values: string | null | (string | null)[]) => {
    return Array.isArray(values) ? values[0] : values;
  },
};
