import { PipeContext } from './pipe-context.type';

export interface ClirioPipe {
  transform(data: any, context: PipeContext): any | never;
}
