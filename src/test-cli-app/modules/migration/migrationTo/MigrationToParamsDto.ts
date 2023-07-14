import { Param } from '../../../../../index';

export class MigrationToParamsDto {
  @Param('name', { cast: 'array' })
  readonly name!: number;
}
