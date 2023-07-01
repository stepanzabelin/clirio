import { Param } from '../../../../../index';

export class GitCheckoutParamsDto {
  @Param('branch')
  readonly branch!: string;
}
