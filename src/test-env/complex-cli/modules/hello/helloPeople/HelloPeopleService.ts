import { HelloPeopleOptionsDto } from './HelloPeopleOptionsDto';

export class HelloPeopleService {
  public entry(options: HelloPeopleOptionsDto) {
    console.log('hello people!', options);
  }
}
