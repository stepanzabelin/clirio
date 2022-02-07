import {
  Module,
  Command,
  Description,
  Empty,
  Failure,
  Options,
} from '../../../../decorators';
import { Helper } from '../../../../decorators/Helper';
import { ClirioHelper } from '../../../../lib/ClirioHelper';
import { VersionService } from './version';
import { HelpService } from './help';
import { CheckService, CheckOptionsDto } from './check';
import { CommonEmptyService } from './empty';
import { CommonFailureService } from './failure';

@Module()
export class CommonModule {
  private readonly versionService = new VersionService();
  private readonly helpService = new HelpService();
  private readonly checkService = new CheckService();
  private readonly commonEmptyService = new CommonEmptyService();
  private readonly commonFailureService = new CommonFailureService();

  @Command('-v, --version')
  public version() {
    this.versionService.entry();
  }

  @Command('-h, --help')
  public help(@Helper() helper: ClirioHelper) {
    const moduleDescription = helper.describeAllModules();
    this.helpService.entry(
      ClirioHelper.formatModuleDescription(moduleDescription)
    );
  }

  @Command('-c, --check')
  @Description('Checking if the script is running')
  public check(@Options() options: CheckOptionsDto) {
    this.checkService.entry(options);
  }

  @Empty()
  public empty() {
    this.commonEmptyService.entry();
  }

  @Failure()
  public failure() {
    this.commonFailureService.entry();
  }
}
