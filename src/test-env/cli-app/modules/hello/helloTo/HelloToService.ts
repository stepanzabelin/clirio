import { HelloToParamsDto } from './HelloToParamsDto';

export class HelloToService {
  public entry(params: HelloToParamsDto) {
    console.log('helloTo!', params);
  }
}
