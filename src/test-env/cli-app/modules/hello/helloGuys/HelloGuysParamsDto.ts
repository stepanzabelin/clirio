import { Param } from '../../../../../index';

export class HelloGuysParamsDto {
  @Param('all-names')
  readonly names!: string[];
}
