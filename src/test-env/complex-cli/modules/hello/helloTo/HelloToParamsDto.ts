import { Param } from '../../../../../index';

export class HelloToParamsDto {
  @Param('first-name')
  readonly firstName?: string;

  @Param()
  readonly 'last-name'?: string;
}
