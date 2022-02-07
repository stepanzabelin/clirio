import Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';
import { Param } from '../../../../../decorators';

export class GitCheckoutParamsDto {
  @Param('branch')
  @JoiSchema(Joi.string().required())
  readonly branch!: string;
}
