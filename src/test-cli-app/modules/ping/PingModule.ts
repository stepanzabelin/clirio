import { Module, Command } from '@clirio';
import { CheckPingService } from './check-ping';

@Module()
export class PingModule {
  private readonly checkPingService = new CheckPingService();

  @Command('ping')
  public ping() {
    this.checkPingService.entry();
  }
}
