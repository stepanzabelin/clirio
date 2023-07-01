import { HelloOptionsDto } from './HelloOptionsDto';

export class HelloService {
  public entry(options: HelloOptionsDto) {
    console.log('hello!', options);
  }
}
