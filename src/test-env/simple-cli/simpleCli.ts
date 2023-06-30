import { Clirio } from '../../index';
import { PingModule } from './modules/ping/PingModule';

export const simpleCli = async (
  errorCallback = (err: any): void => undefined,
  completeCallback = (): void => undefined
) => {
  const cli = new Clirio();
  cli.addModule(PingModule);
  // cli.onComplete(completeCallback);
  // cli.onError(errorCallback);
  await cli.build();
  return cli;
};
