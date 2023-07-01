import { Option } from '../../../../../index';

export class MigrationRunOptionsDto {
  @Option('--env, -e', {
    variable: true,
  })
  readonly envs?: Record<string, string>;

  @Option('--silent, -s')
  readonly silent?: boolean;
}
