import { Option } from '@clirio';

export class MigrationUpOptionsDto {
  @Option('--env, -e')
  readonly envs?: Record<string, string>;

  @Option('--silent, -s')
  readonly silent?: boolean;

  @Option('--id, -i')
  readonly id!: number;

  @Option('--start-date, -b')
  readonly startDate!: string;

  @Option('--end-date, -e')
  readonly endDate?: string;

  @Option('--algorithm, -a')
  readonly algorithm!: null | 'a' | 'b' | 'c';
}
