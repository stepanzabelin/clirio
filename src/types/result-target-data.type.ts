import { ClirioResult } from './clirio-result.type';
import { Constructor } from './constructor.type';

export type ResultTargetData = {
  overwriteGlobal: boolean;
  result: Constructor<ClirioResult> | ClirioResult;
};
