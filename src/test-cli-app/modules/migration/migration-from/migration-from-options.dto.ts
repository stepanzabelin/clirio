import { Validate, Clirio, Option } from '@clirio';
const { OPTIONAL, NULLABLE, STRING, NUMBER, KEY_VALUE, FLAG } = Clirio.valid;

export class MigrationFromOptionsDto {
  @Option('--env, -e')
  @Validate(KEY_VALUE)
  readonly envs?: Record<string, string>;

  @Option('--silent, -s')
  @Validate(FLAG)
  readonly silent?: boolean;

  @Option('--id, -i')
  @Validate(NUMBER)
  readonly id!: number;

  @Option('--start-date, -b')
  @Validate([NULLABLE, STRING])
  readonly startDate!: string;

  @Option('--end-date, -e')
  @Validate([OPTIONAL, STRING])
  readonly endDate?: string;

  @Option('--algorithm, -a')
  @Validate((v) => v === undefined || ['a', 'b', 'c'].includes(v))
  readonly algorithm?: 'a' | 'b' | 'c';
}
