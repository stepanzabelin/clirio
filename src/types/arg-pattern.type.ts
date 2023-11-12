import { ArgPatternType } from './arg-pattern-type.type';

export type ArgPattern = {
  type: ArgPatternType;
  values: string[];
};
