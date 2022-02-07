import { Clirio } from '../../lib/Clirio';
import { CommonModule } from './modules/common/CommonModule';
import { GitModule } from './modules/git/GitModule';
import { HelloModule } from './modules/hello/HelloModule';
import { MigrationModule } from './modules/migration/MigrationModule';

export const complexCli = (
  errorCallback = (err: any): void => undefined,
  successCallback = (): void => undefined
) => {
  const cli = new Clirio();
  cli.setModules([HelloModule, CommonModule, GitModule, MigrationModule]);
  cli.onSuccess(successCallback);
  cli.onError(errorCallback);
  cli.build();
  return cli;
};
