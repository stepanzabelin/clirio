import { Param } from '@clirio';

export class GitCheckoutParamsDto {
  @Param('branch')
  readonly branch!: string;
}
