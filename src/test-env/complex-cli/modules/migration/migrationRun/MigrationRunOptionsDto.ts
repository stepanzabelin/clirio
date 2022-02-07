import Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';
import { Option } from '../../../../../decorators';

export class MigrationRunOptionsDto {
  @Option('--env, -e', {
    variable: true,
  })
  @JoiSchema(Joi.object().pattern(Joi.string(), Joi.string()).optional())
  readonly envs?: Record<string, string>;

  @Option('--silent, -s')
  @JoiSchema(Joi.boolean().optional())
  readonly silent?: boolean;
}
