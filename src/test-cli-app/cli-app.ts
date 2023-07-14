import { Clirio } from '@clirio';
import { CommonModule } from './modules/common/common.module';
import { GitModule } from './modules/git/git.module';
import { HelloModule } from './modules/hello/hello.module';
import { MigrationModule } from './modules/migration/migration.module';
import { PingModule } from './modules/ping/ping.module';

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
