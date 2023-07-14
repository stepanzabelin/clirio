import { Param } from '@clirio';

export class GitAddParamsDto {
  @Param('all-files')
  readonly allFiles!: string[];
}
