import { Param } from '@clirio';

export class MigrationStatusParamsDto {
  @Param('db-tables', { cast: 'plain' })
  readonly tables!: string;
}
