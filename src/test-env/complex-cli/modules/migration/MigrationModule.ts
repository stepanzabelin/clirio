import {
  Module,
  Command,
  Options,
  Empty,
  Failure,
  Hidden,
} from '../../../../decorators';
import { MigrationEmptyService } from './empty';
import { MigrationFailureService } from './failure';
import { MigrationRunOptionsDto, MigrationRunService } from './migrationRun';

@Module('migration')
export class MigrationModule {
  private readonly migrationRunService = new MigrationRunService();
  private readonly migrationEmptyService = new MigrationEmptyService();
  private readonly migrationFailureService = new MigrationFailureService();

  @Command('run')
  @Hidden()
  public run(@Options() options: MigrationRunOptionsDto) {
    this.migrationRunService.entry(options);
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
