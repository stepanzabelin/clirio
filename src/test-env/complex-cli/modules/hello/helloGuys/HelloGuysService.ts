import { HelloGuysParamsDto } from './HelloGuysParamsDto';

export class HelloGuysService {
  public entry(params: HelloGuysParamsDto) {
    console.log('helloGuys!', params);
  }
}
