import Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';
import { Option } from '../../../../../decorators';

export class GitAddOptionsDto {
  @Option('--verbose, -v')
  @JoiSchema(Joi.boolean().optional())
  readonly verbose?: boolean;

  @Option('--chmod')
  @JoiSchema(Joi.string().valid('+x', '-x').optional())
  readonly chmod?: '+x' | '-x';
}
