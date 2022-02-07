import { Clirio } from '../../lib/Clirio';
import { PingModule } from './modules/ping/PingModule';

export const simpleCli = (
  errorCallback = (err: any): void => undefined,
  successCallback = (): void => undefined
) => {
  const cli = new Clirio();
  cli.addModule(PingModule);
  cli.onSuccess(successCallback);
  cli.onError(errorCallback);
  cli.build();
  return cli;
};
