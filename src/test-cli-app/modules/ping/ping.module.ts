import { Module, Command } from '@clirio';

@Module()
export class PingModule {
  @Command('ping')
  public ping() {
    console.log('ping');
  }
}
