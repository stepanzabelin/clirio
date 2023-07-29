import { ClirioPipe, PipeContext } from '@clirio';

export class MigrationUpPipe implements ClirioPipe {
  transform(data: any, input: PipeContext): any | never {
    // throw new Error('1 ');

    return data;
  }
}
