export const VALIDATE = {
  LOGICAL: (value: string | null): boolean => {
    return [null, 'true', 'false'].includes(value);
  },
};
