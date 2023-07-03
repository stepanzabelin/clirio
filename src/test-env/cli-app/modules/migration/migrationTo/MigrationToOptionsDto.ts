import { Validate, Clirio, Option, Transform } from '../../../../../index';

export class MigrationToOptionsDto {
  @Option('--env, -e', {
    variable: true,
  })
  readonly envs?: Record<string, string>;

  @Option('--silent, -s')
  @Validate((v) => v === null)
  @Transform(Clirio.TRANSFORM.LOGICAL)
  readonly silent?: boolean;

  @Option('--id')
  @Transform(Number)
  readonly id!: number;
}
