import { Module, Command, Options, Params, Description } from '@clirio';
import { HelloOptionsDto } from './hello';
import { HelloToParamsDto } from './hello-to';
import { HelloGuysParamsDto } from './hello-guys';
import { HelloPeopleOptionsDto } from './hello-people';
import { HelloUniversalParamsDto } from './hello-universal';

@Module()
export class HelloModule {
  @Command('hello there')
  @Description('Say hello there')
  public helloThere() {
    console.log('hello there!');
  }

  @Command('hello venus|earth|mars')
  @Description('Say hello there')
  public helloPlanet() {
    console.log('helloPlanet');
  }

  @Command('hello')
  @Description('Say hello in person using options')
  public hello(@Options() options: HelloOptionsDto) {
    console.log('hello', options);
  }

  @Command('hello to <first-name> <last-name>')
  @Description('Say hello in person using command')
  public helloTo(@Params() params: HelloToParamsDto) {
    console.log('helloTo', params);
  }

  @Command('hello guys <...all-names>')
  @Description('Say hello to guys')
  public helloGuys(@Params() params: HelloGuysParamsDto) {
    console.log('helloGuys', params);
  }

  @Command('hello people')
  @Description('Say hello to some people')
  public helloPeople(@Options() options: HelloPeopleOptionsDto) {
    console.log('helloPeople', options);
  }

  @Command('hello people|aliens from <planet-name> to <...creature-names>')
  @Description('Say hello to whoever you want')
  public universalHello(@Params() params: HelloUniversalParamsDto) {
    console.log('universalHello', params);
  }
}
