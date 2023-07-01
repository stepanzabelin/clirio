import { Param } from '../../../../../index';

export class MigrationToParamsDto {
  @Param('name')
  readonly name!: number;
}
