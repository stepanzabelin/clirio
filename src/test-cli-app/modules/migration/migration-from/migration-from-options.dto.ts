import { Validate, Clirio, Option } from '@clirio';

export class MigrationFromOptionsDto {
  @Option('--env, -e')
  @Validate(Clirio.valid('KEY_VALUE'))
  readonly envs?: Record<string, string>;

  @Option('--silent, -s')
  @Validate(Clirio.valid('FLAG'))
  readonly silent?: boolean;

  @Option('--id, -i')
  @Validate(Clirio.valid('NUMBER'))
  readonly id!: number;

  @Option('--start-date, -b')
  @Validate(Clirio.valid(['NULLABLE', 'STRING']))
  readonly startDate!: string;

  @Option('--end-date, -e')
  @Validate(Clirio.valid(['OPTIONAL', 'STRING']))
  readonly endDate?: string;

  @Option('--algorithm, -a')
  @Validate((v) => v === undefined || ['a', 'b', 'c'].includes(v))
  readonly algorithm?: 'a' | 'b' | 'c';
}
