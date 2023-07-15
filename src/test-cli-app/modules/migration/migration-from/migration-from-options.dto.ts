import { Validate, Clirio, Option, Transform } from '@clirio';

export class MigrationFromOptionsDto {
  @Option('--env, -e', {
    cast: 'array',
  })
  @Validate(Clirio.valid('KEY_VALUE'))
  readonly envs?: Record<string, string>;

  @Option('--silent, -s')
  @Validate(Clirio.valid('FLAG'))
  readonly silent?: boolean;

  @Option('--id')
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
