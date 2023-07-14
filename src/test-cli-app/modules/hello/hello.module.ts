import { Module, Command, Options, Params, Description } from '@clirio';
import { HelloService, HelloOptionsDto } from './hello';
import { HelloThereService } from './hello-there';
import { HelloToService, HelloToParamsDto } from './hello-to';
import { HelloGuysParamsDto, HelloGuysService } from './hello-guys';
import { HelloPeopleOptionsDto, HelloPeopleService } from './hello-people';

@Module()
export class HelloModule {
  private readonly helloService = new HelloService();
  private readonly helloThereService = new HelloThereService();
  private readonly helloToService = new HelloToService();
  private readonly helloGuysService = new HelloGuysService();
  private readonly helloPeopleService = new HelloPeopleService();

  @Command('hello there')
  @Description('Say hello there')
  public helloThere() {
    this.helloThereService.entry();
  }

  @Command('hello world|mars')
  @Description('Say hello there')
  public helloWorld() {
    this.helloThereService.entry();
  }

  @Command('hello')
  @Description('Say hello in person using options')
  public hello(@Options() options: HelloOptionsDto) {
    this.helloService.entry(options);
  }

  @Command('hello to <first-name> <last-name>')
  @Description('Say hello in person using command')
  public helloTo(@Params() params: HelloToParamsDto) {
    this.helloToService.entry(params);
  }

  @Command('hello guys <...all-names>')
  @Description('Say hello to some people')
  public helloGuys(@Params() params: HelloGuysParamsDto) {
    this.helloGuysService.entry(params);
  }

  @Command('hello people')
  @Description('Say hello to some people')
  public helloPeople(@Options() options: HelloPeopleOptionsDto) {
    this.helloPeopleService.entry(options);
  }
}
