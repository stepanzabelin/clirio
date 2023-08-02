import { Module, Command, Options, Params } from '@clirio';
import { HelloOptionsDto } from './hello';
import { HelloToParamsDto } from './hello-to';
import { HelloGuysParamsDto } from './hello-guys';
import { HelloPeopleOptionsDto } from './hello-people';
import { HelloUniversalParamsDto } from './hello-universal';

@Module()
export class HelloModule {
  @Command('hello there', { description: 'Say hello there' })
  public helloThere() {
    console.log('hello there!');
  }

  @Command('hello venus|earth|mars', { description: 'Say hello to the planet' })
  public helloPlanet() {
    console.log('helloPlanet');
  }

  @Command('hello', { description: 'Say hello in person using options' })
  public hello(@Options() options: HelloOptionsDto) {
    console.log('hello', options);
  }

  @Command('hello-unknown', {
    description: 'Say hello in person using options',
  })
  public helloUnknown(@Options() options: unknown) {
    console.log('hello-unknown', options);
  }

  @Command('hello to <first-name> <last-name>', {
    description: 'Say hello in person using command',
  })
  public helloTo(@Params() params: HelloToParamsDto) {
    console.log('helloTo', params);
  }

  @Command('hello to-unknown <first-name> <last-name>', {
    description: 'Say hello in person using command',
  })
  public helloToUnknown(@Params() params: unknown) {
    console.log('helloToUnc', params);
  }

  @Command('hello guys <...all-names>', { description: 'Say hello to guys' })
  public helloGuys(@Params() params: HelloGuysParamsDto) {
    console.log('helloGuys', params);
  }

  @Command('hello unknown-guys <...all-names>', {
    description: 'Say hello to guys',
  })
  public helloUnknownGuys(@Params() params: unknown) {
    console.log('helloUnknownGuys', params);
  }

  @Command('hello people', { description: 'Say hello to some people' })
  public helloPeople(@Options() options: HelloPeopleOptionsDto) {
    console.log('helloPeople', options);
  }

  @Command('hello people|aliens from <planet-name> to <...creature-names>', {
    description: 'Say hello to whoever you want',
  })
  public universalHello(@Params() params: HelloUniversalParamsDto) {
    console.log('universalHello', params);
  }

  @Command('hello planet-creatures <planet-name> <...creature-names>', {
    description: 'Say hello to whoever you want',
  })
  public helloPlanetCreatures(@Params() params: HelloUniversalParamsDto) {
    console.log('shortUniversalHello', params);
  }
}
