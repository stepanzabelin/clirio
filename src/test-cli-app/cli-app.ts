import { Clirio } from '@clirio';
import { CommonModule } from './modules/common/common.module';
import { GitModule } from './modules/git';
import { HelloModule } from './modules/hello/hello.module';
import { MigrationModule } from './modules/migration';
import { PingModule } from './modules/ping';

export const cliApp = async () => {
  const cli = new Clirio();
  cli.setModules([
    HelloModule,
    CommonModule,
    GitModule,
    new MigrationModule(),
    PingModule,
  ]);
  await cli.execute();
  return cli;
};
