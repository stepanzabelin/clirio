import { Validate, Clirio, Option, Transform } from '../../../../../index';

export class MigrationToOptionsDto {
  @Option('--env, -e', {
    cast: 'array',
  })
  @Validate(Clirio.valid('KEY_VALUE'))
  @Transform(Clirio.form('KEY_VALUE'))
  readonly envs?: Record<string, string>;

  @Option('--silent, -s')
  @Validate(Clirio.valid('FLAG'))
  @Transform(Clirio.form('FLAG'))
  readonly silent?: boolean;

  @Option('--id')
  @Transform(Number)
  readonly id!: number;
}
