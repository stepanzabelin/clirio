import { Param, Transform } from '@clirio';

export class MigrationToParamsDto {
  @Param('type-id')
  @Transform(Number)
  readonly typeId!: number;
}
