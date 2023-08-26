import { Module, Command, Envs, Empty, Failure } from '@clirio';
import { AuthWeatherEnvDto } from './auth-weather/auth-weather-envs.dto';
import { GetWeatherEnvDto } from './get-weather';

@Module('weather')
export class WeatherModule {
  @Command('auth')
  public auth(@Envs() envs: AuthWeatherEnvDto) {
    console.log(envs);
  }

  @Command('get')
  public get(@Envs() envs: GetWeatherEnvDto) {
    console.log(envs);
  }

  @Empty()
  public empty() {
    console.log('weather empty');
  }

  @Failure()
  public failure() {
    console.log('weather failure');
  }
}
