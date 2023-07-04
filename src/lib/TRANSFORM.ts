import { keyValueReg } from '../constrains/regexp.config';

export const TRANSFORM = {
  LOGICAL: (value: string | null): boolean => {
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
    values: string | null | (string | null)[]
  ): Record<string, string> => {
    const obj: Record<string, string> = {};

    if (!Array.isArray(values)) {
      return obj;
    }

    for (const value of values) {
      const matchVariable = String(value).match(keyValueReg);

      if (matchVariable) {
        const { key, value } = matchVariable!.groups!;
        obj[key] = value;
      }
    }

    return obj;
  },
};
