import { GitStatusOptionsDto } from './git-status-options.dto';

export class GitStatusService {
  public status(options: GitStatusOptionsDto) {
    console.log(options);
  }
}
