import { GitAddOptionsDto } from './GitAddOptionsDto';
import { GitAddParamsDto } from './GitAddParamsDto';

export class GitAddService {
  public add(params: GitAddParamsDto, options: GitAddOptionsDto) {
    console.log(params, options);
  }
}
