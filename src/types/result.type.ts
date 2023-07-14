import { ClirioResult } from './clirio-result.type';
import { Constructor } from './constructor.type';

export type Result = Constructor<ClirioResult> | ClirioResult;
