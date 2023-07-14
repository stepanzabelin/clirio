import { HelloPeopleOptionsDto } from './hello-people-options.dto';

export class HelloPeopleService {
  public entry(options: HelloPeopleOptionsDto) {
    console.log('hello people!', options);
  }
}
