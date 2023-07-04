import { Transform, Validate } from '../../../../../decorators';
import { Clirio, Option } from '../../../../../index';

export class MigrationRunOptionsDto {
  @Option('--env, -e', {
    cast: 'array',
  })
  @Validate(Clirio.valid('KEY_VALUE'))
  @Transform(Clirio.form('KEY_VALUE'))
  readonly envs?: Record<string, string>;

  @Option('--silent, -s')
  @Validate(Clirio.VALIDATOR.NULL)
  readonly silent?: boolean;
}
