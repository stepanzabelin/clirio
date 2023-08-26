import { Clirio } from '@clirio';
import { CommonModule } from './modules/common/common.module';
import { GitModule } from './modules/git';
import { HelloModule } from './modules/hello/hello.module';
import { MigrationModule } from './modules/migration';
import { PingModule } from './modules/ping';
import { WeatherModule } from './modules/weather/weather.module';

export const cliApp = async () => {
  const cli = new Clirio();
  cli.setModules([
    HelloModule,
    GitModule,
    new MigrationModule(),
    PingModule,
    CommonModule,
    WeatherModule,
  ]);
  await cli.execute();
  return cli;
};
