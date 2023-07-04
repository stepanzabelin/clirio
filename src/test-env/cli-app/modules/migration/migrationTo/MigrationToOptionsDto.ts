import { Validate, Clirio, Option, Transform } from '../../../../../index';

export class MigrationToOptionsDto {
  @Option('--env, -e', {
    cast: 'array',
  })
  @Validate(Clirio.VALIDATOR.KEY_VALUE)
  @Transform(Clirio.TRANSFORMER.KEY_VALUE)
  readonly envs?: Record<string, string>;

  @Option('--silent, -s')
  @Validate(Clirio.VALIDATOR.LOGICAL)
  @Transform(Clirio.TRANSFORMER.LOGICAL)
  readonly silent?: boolean;

  @Option('--id')
  @Transform(Number)
  readonly id!: number;
}
