import {
  Module,
  Command,
  Options,
  Empty,
  Failure,
  Hidden,
  Pipe,
  Params,
} from '@clirio';
import { MigrationRunOptionsDto } from './migration-run';
import {
  MigrationStatusOptionsDto,
  MigrationStatusParamsDto,
} from './migration-status';
import {
  MigrationToPipe,
  MigrationToParamsDto,
  MigrationToOptionsDto,
} from './migration-to';

@Module('migration')
export class MigrationModule {
  @Command('run')
  @Hidden()
  public run(@Options() options: MigrationRunOptionsDto) {
    console.log('migration run', options);
  }

  @Command('to <type-id>')
  @Pipe(MigrationToPipe)
  public to(
    @Params() params: MigrationToParamsDto,
    @Options() options: MigrationToOptionsDto,
  ) {
    console.log('migration to', params, options);
  }

  @Command('status <...db-tables>')
  public status(
    @Params() params: MigrationStatusParamsDto,
    @Options() options: MigrationStatusOptionsDto,
  ) {
    console.log('migration status', params, options);
  }

  @Command('status-unknown <...db-tables>')
  public statusUnknown(@Params() params: unknown, @Options() options: unknown) {
    console.log('migration status unknown', params, options);
  }

  @Empty()
  public empty() {
    console.log('migration empty');
  }

  @Failure()
  public failure() {
    console.log('migration failure');
  }
}
