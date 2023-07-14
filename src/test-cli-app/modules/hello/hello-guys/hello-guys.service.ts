import { HelloGuysParamsDto } from './hello-guys-params.dto';

export class HelloGuysService {
  public entry(params: HelloGuysParamsDto) {
    console.log('hello-guys!', params);
  }
}
