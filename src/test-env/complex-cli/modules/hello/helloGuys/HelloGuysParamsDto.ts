import Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';
import { Param } from '../../../../../decorators';

export class HelloGuysParamsDto {
  @Param('all-names')
  @JoiSchema(Joi.array().items(Joi.string()).required())
  readonly names!: string[];
}
