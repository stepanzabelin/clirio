import { Param } from '../../../../../decorators';

export class GitAddParamsDto {
  @Param('all-files')
  readonly allFiles!: string[];
}
