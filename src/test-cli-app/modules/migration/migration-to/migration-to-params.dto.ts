import { Param } from '@clirio';

export class MigrationToParamsDto {
  @Param('name', { cast: 'array' })
  readonly name!: number;
}
