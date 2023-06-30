import { ResultContext } from './ResultContext';

export interface ClirioResult {
  complete(context: ResultContext): any | never;
}
