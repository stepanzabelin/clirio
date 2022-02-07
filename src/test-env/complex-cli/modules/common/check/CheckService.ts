import { CheckOptionsDto } from './CheckOptionsDto';

export class CheckService {
  public entry(options: CheckOptionsDto) {
    console.log('check!', options);
  }
}
