import { Module, Command, Empty, Failure, Filter } from '@clirio';
import { PingPingsFilter } from './pong/ping-pong.filter';

@Module('ping')
export class PingModule {
  @Command('test')
  public test() {
    console.log('ping test');
  }

  @Command('pong')
  @Filter(PingPingsFilter)
  public pong() {
    console.log('ping test');
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
