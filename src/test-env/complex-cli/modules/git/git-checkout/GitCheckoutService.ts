import { GitCheckoutParamsDto } from './GitCheckoutParamsDto';

export class GitCheckoutService {
  public checkout(params: GitCheckoutParamsDto) {
    console.log(params);
  }
}
