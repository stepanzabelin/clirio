import { Clirio } from '../../index';
import { Constructor } from '../../types';
import { CommonModule } from './modules/common/CommonModule';
import { GitModule } from './modules/git/GitModule';
import { HelloModule } from './modules/hello/HelloModule';
import { MigrationModule } from './modules/migration/MigrationModule';

export const buildTestCli = async (modules: Constructor<any>[]) => {
  const cli = new Clirio();
  cli.setModules(modules);
  await cli.build();
  return cli;
};
