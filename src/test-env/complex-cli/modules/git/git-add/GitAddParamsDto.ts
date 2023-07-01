import { Param } from '../../../../../index';

export class GitAddParamsDto {
  @Param('all-files')
  readonly allFiles!: string[];
}
