import { Param } from '@clirio';

export class HelloUniversalParamsDto {
  @Param('planet-name')
  readonly planet!: string;

  @Param('creature-names', { cast: 'array' })
  readonly creatureNames!: string[];
}
