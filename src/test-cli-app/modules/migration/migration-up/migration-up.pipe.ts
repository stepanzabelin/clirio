import { ClirioPipe, PipeContext } from '@clirio';

export class MigrationUpPipe implements ClirioPipe {
  transform(data: any, input: PipeContext): any | never {
    console.log('PIPE input', input);
    console.log('PIPE data', data);

    return data;
  }
}
