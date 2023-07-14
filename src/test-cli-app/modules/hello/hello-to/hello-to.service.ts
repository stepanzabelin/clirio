import { HelloToParamsDto } from './hello-to-params.dto';

export class HelloToService {
  public entry(params: HelloToParamsDto) {
    console.log('hello-to!', params);
  }
}
