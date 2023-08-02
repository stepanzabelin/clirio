import { Module, Command, Options, Params } from '@clirio';
import { GitAddOptionsDto, GitAddParamsDto } from './git-add';
import { GitCheckoutParamsDto } from './git-checkout';
import { GitStatusOptionsDto } from './git-status';

@Module('git')
export class GitModule {
  @Command('status')
  public status(@Options() options: GitStatusOptionsDto) {
    console.log('git status', options);
  }

  @Command('checkout <branch>')
  public checkout(@Params() params: GitCheckoutParamsDto) {
    console.log('git checkout', params);
  }

  @Command('add <...all-files>')
  public add(
    @Params() params: GitAddParamsDto,
    @Options() options: GitAddOptionsDto,
  ) {
    console.log('git add', params, options);
  }
}
