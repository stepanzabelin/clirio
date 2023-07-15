import { HelloUniversalParamsDto } from './hello-universal-params.dto';

export class HelloUniversalService {
  public entry(params: HelloUniversalParamsDto) {
    console.log('hello-universal!', params);
  }
}
