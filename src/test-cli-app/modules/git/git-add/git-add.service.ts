import { GitAddOptionsDto } from './git-add-options.dto';
import { GitAddParamsDto } from './git-add-params.dto';

export class GitAddService {
  public add(params: GitAddParamsDto, options: GitAddOptionsDto) {
    console.log(params, options);
  }
}
