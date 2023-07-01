import {
  Module,
  Command,
  Options,
  Empty,
  Failure,
  Hidden,
  Pipe,
  Params,
} from '../../../../index';
import { MigrationEmptyService } from './empty';
import { MigrationFailureService } from './failure';
import { MigrationRunOptionsDto, MigrationRunService } from './migrationRun';
import {
  MigrationToService,
  MigrationToPipe,
  MigrationToParamsDto,
  MigrationToOptionsDto,
} from './migrationTo';

@Module('migration')
export class MigrationModule {
  private readonly migrationRunService = new MigrationRunService();
  private readonly migrationEmptyService = new MigrationEmptyService();
  private readonly migrationFailureService = new MigrationFailureService();
  private readonly migrationToService = new MigrationToService();

  @Command('run')
  @Hidden()
  public run(@Options() options: MigrationRunOptionsDto) {
    this.migrationRunService.entry(options);
  }

  @Command('to <name>')
  @Pipe(MigrationToPipe)
  public to(
    @Params() params: MigrationToParamsDto,
    @Options() options: MigrationToOptionsDto
  ) {
    this.migrationToService.entry(params, options);
  }

  @Empty()
  public empty() {
    this.migrationEmptyService.entry();
  }

  @Failure()
  public failure() {
    this.migrationFailureService.entry();
  }
}
