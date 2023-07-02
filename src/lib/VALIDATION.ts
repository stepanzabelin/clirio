export const VALIDATION = {
  LOGICAL: (value: string | null): boolean => {
    return [null, 'true', 'false'].includes(value);
  },
};
