import { HelloOptionsDto } from './hello-options.dto';

export class HelloService {
  public entry(options: HelloOptionsDto) {
    console.log('hello!', options);
  }
}
