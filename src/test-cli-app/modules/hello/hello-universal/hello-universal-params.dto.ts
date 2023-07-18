import { Clirio, Param, Transform } from '@clirio';

export class HelloUniversalParamsDto {
  @Param('planet-name')
  readonly planet!: string;

  @Param('creature-names')
  @Transform(Clirio.form('ARRAY'))
  readonly creatureNames!: string[];
}
