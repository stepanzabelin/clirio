import { Param } from '../../../../../decorators';

export class GitCheckoutParamsDto {
  @Param('branch')
  readonly branch!: string;
}
