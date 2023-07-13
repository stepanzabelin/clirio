import { ClirioResult } from './ClirioResult';
import { Constructor } from './Constructor';

export type ResultTargetData = {
  overwriteGlobal: boolean;
  result: Constructor<ClirioResult> | ClirioResult;
};
