import { ArgType } from './arg-type.type';

export type ActionArg = {
  type: ArgType.Action;
  key: number;
  value: string;
};
