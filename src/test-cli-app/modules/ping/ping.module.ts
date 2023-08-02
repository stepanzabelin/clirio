import {
  Module,
  Command,
  Empty,
  Failure,
  Filter,
  ClirioHelper,
  Helper,
} from '@clirio';
import { PingPongFilter } from './pong/ping-pong.filter';

@Module('ping')
export class PingModule {
  @Command('test')
  public test() {
    console.log('ping test');
  }

  @Command('pong')
  @Filter(PingPongFilter)
  public pong() {
    console.log('ping test');
  }

  @Command('-h, --help')
  public help(@Helper() helper: ClirioHelper) {
    const dump = helper.dumpThisModule();

    console.log(ClirioHelper.formatDump(dump));
  }

  @Empty()
  public empty() {
    console.log('ping empty');
  }

  @Failure()
  public failure() {
    console.log('ping failure');
  }
}
