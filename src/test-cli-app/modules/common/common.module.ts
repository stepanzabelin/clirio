import {
  Module,
  Command,
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
    console.log(helper);

    const dump = helper.dumpAll();

    console.log({ dump });
    console.log(ClirioHelper.formatDump(dump));
  }

  @Command('-c, --check', { description: 'Checking if the script is running' })
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
