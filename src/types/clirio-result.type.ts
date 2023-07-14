import { ResultContext } from './result-context.type';

export interface ClirioResult {
  complete(context: ResultContext): any | never;
}
