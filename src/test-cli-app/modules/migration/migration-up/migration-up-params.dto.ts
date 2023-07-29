import { Clirio, Param, Validate } from '@clirio';

export class MigrationUpParamsDto {
  @Param('type-id')
  @Validate(Clirio.valid.NUMBER)
  readonly typeId!: number;
}
