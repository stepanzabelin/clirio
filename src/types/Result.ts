import { ClirioResult } from './ClirioResult';
import { Constructor } from './Constructor';

export type Result = Constructor<ClirioResult> | ClirioResult;
