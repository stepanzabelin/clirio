import { Param } from '../../../../../index';

export class MigrationToParamsDto {
  @Param('name', { isArray: true })
  readonly name!: number;
}
