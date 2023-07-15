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

  @Command('to <...name>')
  @Pipe(MigrationToPipe)
  public to(
    @Params() params: MigrationToParamsDto,
    @Options() options: MigrationToOptionsDto,
  ) {
    console.log('migration to', params, options);
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
