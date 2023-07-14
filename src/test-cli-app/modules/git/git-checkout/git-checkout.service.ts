import { GitCheckoutParamsDto } from './git-checkout-params.dto';

export class GitCheckoutService {
  public checkout(params: GitCheckoutParamsDto) {
    console.log(params);
  }
}
