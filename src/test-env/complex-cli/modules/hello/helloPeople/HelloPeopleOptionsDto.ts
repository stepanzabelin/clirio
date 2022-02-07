import Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';
import { Option } from '../../../../../decorators';

export class HelloPeopleOptionsDto {
  @Option('--name, -n', {
    isArray: true,
  })
  @JoiSchema(Joi.array().items(Joi.string()).required())
  readonly names!: string[];
}
