import { ArgType } from './arg-type.type';

export type ParsedArg = {
  type: ArgType;
  key: string;
  value: string | null;
};
