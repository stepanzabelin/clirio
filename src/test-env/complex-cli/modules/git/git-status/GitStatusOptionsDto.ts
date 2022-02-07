import Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';
import { Option } from '../../../../../decorators';

export class GitStatusOptionsDto {
  @Option('--branch, -b')
  @JoiSchema(Joi.string().optional())
  readonly branch?: string;

  @Option('--short, -s')
  @JoiSchema(Joi.boolean().optional())
  readonly short?: boolean;

  @Option('--ignore-submodules')
  @JoiSchema(Joi.string().valid('none', 'untracked', 'dirty', 'all').optional())
  readonly ignoreSubmodules?: 'none' | 'untracked' | 'dirty' | 'all';
}
