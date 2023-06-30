import { Param } from '../../../../../decorators';

export class HelloGuysParamsDto {
  @Param('all-names')
  readonly names!: string[];
}
