import { Param } from '@clirio';

export class HelloToParamsDto {
  @Param('first-name')
  readonly firstName?: string;

  @Param()
  readonly 'last-name'?: string;
}
