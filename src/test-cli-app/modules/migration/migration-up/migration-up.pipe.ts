import { ClirioPipe, PipeContext } from '@clirio';

export class MigrationUpPipe implements ClirioPipe {
  transform(data: any, input: PipeContext): any | never {
    return data;
  }
}
