import { Validate } from '../../../../../decorators/Validate';
import { Clirio, Option, Transform } from '../../../../../index';

export class MigrationToOptionsDto {
  @Option('--env, -e', {
    variable: true,
  })
  readonly envs?: Record<string, string>;

  @Option('--silent, -s')
  @Validate(Clirio.VD.LOGICAL)
  @Transform(Clirio.TF.LOGICAL)
  readonly silent?: boolean;

  @Option('--id')
  @Transform(Number)
  readonly id!: number;
}
