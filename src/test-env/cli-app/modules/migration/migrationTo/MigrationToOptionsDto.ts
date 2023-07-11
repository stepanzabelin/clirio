import { Validate, Clirio, Option, Transform } from '../../../../../index';

export class MigrationToOptionsDto {
  @Option('--env, -e', {
    cast: 'array',
  })
  @Validate(Clirio.validations.KEY_VALUE)
  @Transform(Clirio.transformations.KEY_VALUE)
  readonly envs?: Record<string, string>;

  @Option('--silent, -s')
  @Validate(Clirio.validations.FLAG)
  @Transform(Clirio.transformations.FLAG)
  readonly silent?: boolean;

  @Option('--id')
  @Transform(Number)
  readonly id!: number;
}
