import { keyValueReg } from '../constrains';

export const form = {
  NUMBER: (value: any): number => {
    return Number(value) || 0;
  },

  STRING: (value: any): string => {
    return String(value ?? '');
  },

  BOOLEAN: (value: any): boolean => {
    return Boolean(value);
  },

  FLAG: (value: any): boolean => {
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

  KEY_VALUE: (value: any): Record<string, string | null> => {
    if (value === undefined) {
      return {};
    }

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

  ARRAY: (value: any): (string | null)[] => {
    if (value === undefined) {
      return [];
    }
    return Array.isArray(value) ? value : [value];
  },

  PLAIN: (value: any): undefined | string | null => {
    return Array.isArray(value) ? value[0] : value;
  },
};
