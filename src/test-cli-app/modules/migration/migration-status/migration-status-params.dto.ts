import { Clirio, Param, Transform } from '@clirio';

export class MigrationStatusParamsDto {
  @Param('db-tables')
  @Transform(Clirio.form('PLAIN'))
  readonly tables!: string;
}
