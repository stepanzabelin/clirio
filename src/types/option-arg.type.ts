import { ArgType } from './arg-type.type';

export type OptionArg = {
  type: ArgType.Option;
  key: string;
  value: string | null;
};
