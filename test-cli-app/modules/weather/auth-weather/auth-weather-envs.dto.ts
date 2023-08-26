import { Validate, Clirio, Env } from '@clirio';

export class AuthWeatherEnvDto {
  @Env('WEATHER_API_KEY', { description: 'Weather Api key' })
  @Validate(Clirio.valid.STRING)
  readonly key!: string;

  @Env('WEATHER_API_VERSION', { description: 'Weather Api secure' })
  @Validate(Clirio.valid.NUMBER)
  readonly version!: number;

  @Env()
  @Validate(Clirio.valid.FLAG)
  readonly WEATHER_EXTENDED!: boolean;

  @Env()
  readonly SECURE!: boolean;
}
