import { Param } from '@clirio';

export class HelloGuysParamsDto {
  @Param('all-names')
  readonly names!: string[];
}
