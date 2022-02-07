import { ArgType } from './ArgType';

export type ParsedArg = {
  type: ArgType;
  key: string;
  value: string | null;
};
