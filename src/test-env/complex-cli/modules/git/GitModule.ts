import { Module, Command, Options, Params } from '../../../../decorators';
import { GitAddOptionsDto, GitAddParamsDto, GitAddService } from './git-add';
import { GitCheckoutParamsDto, GitCheckoutService } from './git-checkout';
import { GitStatusOptionsDto, GitStatusService } from './git-status';

@Module('git')
export class GitModule {
  private readonly gitStatusService = new GitStatusService();
  private readonly gitCheckoutService = new GitCheckoutService();
  private readonly gitAddService = new GitAddService();

  @Command('status')
  public status(@Options() options: GitStatusOptionsDto) {
    this.gitStatusService.status(options);
  }

  @Command('checkout <branch>')
  public checkout(@Params() params: GitCheckoutParamsDto) {
    this.gitCheckoutService.checkout(params);
  }

  @Command('add <...all-files>')
  public add(
    @Params() params: GitAddParamsDto,
    @Options() options: GitAddOptionsDto
  ) {
    this.gitAddService.add(params, options);
  }
}
