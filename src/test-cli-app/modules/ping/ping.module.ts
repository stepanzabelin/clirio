import { Module, Command, Empty, Failure } from '@clirio';

@Module('ping')
export class PingModule {
  @Command('test')
  public test() {
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
