import {
  Module,
  Command,
  Description,
  Empty,
  Failure,
  Options,
  Helper,
  ClirioHelper,
} from '@clirio';
import { CheckOptionsDto } from './check';

@Module()
export class CommonModule {
  @Command('-v, --version')
  public version() {
    console.log('version');
  }

  @Command('-h, --help')
  public help(@Helper() helper: ClirioHelper) {
    const moduleDescription = helper.describeAllModules();
    console.log(ClirioHelper.formatModuleDescription(moduleDescription));
  }

  @Command('-c, --check')
  @Description('Checking if the script is running')
  public check(@Options() options: CheckOptionsDto) {
    console.log('check', options);
  }

  @Empty()
  public empty() {
    console.log('empty');
  }

  @Failure()
  public failure() {
    console.log('failure');
  }
}
