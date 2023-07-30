import {
  Module,
  Command,
  Options,
  Empty,
  Failure,
  Params,
  Pipe,
} from '@clirio';
import { MigrationRunOptionsDto } from './migration-run';
import {
  MigrationStatusOptionsDto,
  MigrationStatusParamsDto,
} from './migration-status';
import { MigrationToParamsDto, MigrationToOptionsDto } from './migration-to';
import {
  MigrationFromParamsDto,
  MigrationFromOptionsDto,
} from './migration-from';
import {
  MigrationUpOptionsDto,
  MigrationUpParamsDto,
  MigrationUpPipe,
} from './migration-up';

// import {
//   MigrationUpPipe,
//   MigrationUpParamsDto,
//   MigrationUpOptionsDto,
// } from './migration-up';

@Module('migration')
export class MigrationModule {
  @Command('run', { hidden: true })
  public run(@Options() options: MigrationRunOptionsDto) {
    console.log('migration run', options);
  }

  @Command('up <type-name> <type-id> ')
  @Pipe(MigrationUpPipe)
  public up(
    @Params() params: MigrationUpParamsDto,
    @Options() options: MigrationUpOptionsDto,
  ) {
    // console.log('migration from', params, options);
  }

  @Command('from <type-id> <type-name>')
  public from(
    @Params() params: MigrationFromParamsDto,
    @Options() options: MigrationFromOptionsDto,
  ) {
    console.log('migration from', params, options);
  }

  @Command('to <type-id> <type-name>')
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
