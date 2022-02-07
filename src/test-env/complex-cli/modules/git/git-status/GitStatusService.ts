import { GitStatusOptionsDto } from './GitStatusOptionsDto';

export class GitStatusService {
  public status(options: GitStatusOptionsDto) {
    console.log(options);
  }
}
