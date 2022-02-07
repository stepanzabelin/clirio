import Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';
import { Option } from '../../../../../decorators';

export class CheckOptionsDto {
  @Option('--verbose, -v')
  @JoiSchema(Joi.boolean().optional())
  readonly verbose?: boolean;

  @Option('--pool, -p')
  @JoiSchema(Joi.number().required())
  readonly pool!: number;
}
