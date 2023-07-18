import { Clirio, Option, Transform } from '@clirio';

export class MigrationToOptionsDto {
  @Option('--env, -e')
  @Transform(Clirio.form('KEY_VALUE'))
  readonly envs?: Record<string, string>;

  @Option('--silent, -s')
  @Transform(Clirio.form('FLAG'))
  readonly silent?: boolean;

  @Option('-i, --id')
  @Transform(Number)
  readonly id!: number;

  @Option('--start-date')
  readonly startDate!: string;

  @Option('--end-date')
  readonly endDate!: string;

  @Option('--algorithm, -a')
  @Transform((v) => (['a', 'b', 'c'].includes(String(v)) ? v : null))
  readonly algorithm!: null | 'a' | 'b' | 'c';
}
