import { ClirioError } from '../../../../../exceptions';
import { ClirioPipe, PipeContext } from '../../../../../index';

export class MigrationToPipe implements ClirioPipe {
  transform(data: any, input: PipeContext): any | never {
    console.log('PIPE input', input);
    console.log('PIPE data', data);

    // throw new ClirioError('er');
    return data;
  }
}