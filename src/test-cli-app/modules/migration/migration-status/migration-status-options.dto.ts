import { Option } from '@clirio';

export class MigrationStatusOptionsDto {
  @Option('--id, -i', { cast: 'array' })
  readonly id?: string;

  @Option('-d, --from-date')
  readonly d?: string;

  @Option('-f, --format', { cast: 'plain' })
  readonly format?: string;

  @Option('--verbose')
  readonly silent?: null;
}
