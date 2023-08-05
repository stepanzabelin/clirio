import { Clirio, Param, Validate } from '@clirio';

export class MigrationFromParamsDto {
  @Param('type-id')
  @Validate(Clirio.valid.NUMBER)
  readonly typeId!: number;

  @Param('type-name')
  @Validate((v) => String(v).startsWith('type-'))
  readonly typeName!: string;
}
