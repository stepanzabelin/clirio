import { Clirio, Option, Transform } from '@clirio';

export class MigrationStatusOptionsDto {
  @Option('--id, -i')
  @Transform(Clirio.form.ARRAY)
  readonly id?: string[];

  @Option('-d, --from-date')
  readonly d?: string;

  @Option('-f, --format')
  @Transform(Clirio.form.PLAIN)
  readonly format?: string;

  @Option('--verbose')
  readonly silent?: null;
}
