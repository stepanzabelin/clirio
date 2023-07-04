import { Transform, Validate } from '../../../../../decorators';
import { Clirio, Option } from '../../../../../index';

export class MigrationRunOptionsDto {
  @Option('--env, -e', {
    cast: 'array',
  })
  @Validate(Clirio.VALIDATE.KEY_VALUE)
  @Transform(Clirio.TRANSFORM.KEY_VALUE)
  readonly envs?: Record<string, string>;

  @Option('--silent, -s')
  readonly silent?: boolean;
}
