import { Clirio } from '../../lib/Clirio';
import { PingModule } from './modules/ping/PingModule';

export const simpleCli = async (
  errorCallback = (err: any): void => undefined,
  successCallback = (): void => undefined
) => {
  const cli = new Clirio();
  cli.addModule(PingModule);
  cli.onSuccess(successCallback);
  cli.onError(errorCallback);
  await cli.build();
  return cli;
};
