import { Transform, Validate } from '../../../../../decorators';
import { Clirio, Option } from '../../../../../index';

export class MigrationRunOptionsDto {
  @Option('--env, -e', {
    cast: 'array',
  })
  @Validate(Clirio.VALIDATOR.KEY_VALUE)
  @Transform(Clirio.TRANSFORMER.KEY_VALUE)
  readonly envs?: Record<string, string>;

  @Option('--silent, -s')
  @Validate(Clirio.VALIDATOR.NULL)
  readonly silent?: boolean;
}
