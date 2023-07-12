import { PipeContext } from './PipeContext'

export interface ClirioPipe {
  transform(data: any, context: PipeContext): any | never
}
