import { Clirio } from '../../index';
import { CommonModule } from './modules/common/CommonModule';
import { GitModule } from './modules/git/GitModule';
import { HelloModule } from './modules/hello/HelloModule';
import { MigrationModule } from './modules/migration/MigrationModule';

export const complexCli = async (
  errorCallback = (err: any): void => undefined,
  completeCallback = (): void => undefined
) => {
  const cli = new Clirio();
  cli.setModules([HelloModule, CommonModule, GitModule, new MigrationModule()]);
  // cli.onComplete(completeCallback);
  cli.setConfig({ allowUncontrolledOptions: false });
  // cli.onError(errorCallback);
  await cli.build();
  return cli;
};
