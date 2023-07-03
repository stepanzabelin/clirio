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
        break;
    }
  },
};
