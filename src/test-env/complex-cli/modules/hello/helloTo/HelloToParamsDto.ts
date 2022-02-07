import Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';
import { Param } from '../../../../../decorators';

export class HelloToParamsDto {
  @Param('first-name')
  @JoiSchema(Joi.string().optional())
  readonly firstName?: string;

  @Param()
  @JoiSchema(Joi.string().optional())
  readonly 'last-name'?: string;
}
