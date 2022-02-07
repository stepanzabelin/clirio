import { Module, Command } from '../../../../decorators';
import { CheckPingService } from './check-ping';

@Module()
export class PingModule {
  private readonly checkPingService = new CheckPingService();

  @Command('ping')
  public ping() {
    this.checkPingService.entry();
  }
}
