import { CheckOptionsDto } from './check-options.dto';

export class CheckService {
  public entry(options: CheckOptionsDto) {
    console.log('check!', options);
  }
}
