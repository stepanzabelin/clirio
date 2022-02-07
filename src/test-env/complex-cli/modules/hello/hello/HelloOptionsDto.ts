import Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';
import { Description, Option } from '../../../../../decorators';

export class HelloOptionsDto {
  @Option('--first-name, -f')
  @Description('First name')
  @JoiSchema(Joi.string().required())
  readonly firstName?: string;

  @Option('--last-name, -l')
  @Description('Last name')
  @JoiSchema(Joi.string().required())
  readonly lastName?: string;

  @Option('--verbose')
  @Description('Verbose')
  @JoiSchema(Joi.boolean().optional())
  readonly verbose?: boolean;
}
