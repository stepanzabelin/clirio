import { Param } from '@clirio';

export class MigrationUpParamsDto {
  @Param('type-id')
  readonly typeId!: number;
}
