import Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';
import { Param } from '../../../../../decorators';

export class GitAddParamsDto {
  @Param('all-files')
  @JoiSchema(Joi.array().items(Joi.string()).required())
  readonly allFiles!: string[];
}
