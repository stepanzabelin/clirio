import { Clirio } from '@clirio';
import sinon from 'sinon';
import { CommonFailureService } from '../test-cli-app/modules/common/failure';
import { HelloModule } from '../test-cli-app/modules/hello';
import { MigrationFailureService } from '../test-cli-app/modules/migration/failure';

const buildCli = () => {
  const cli = new Clirio();
  cli.setModules([HelloModule]);
  return cli;
};

describe('Failure command', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  // it('Failure without handler', async () => {
  //   const errorCallbackStub = sinon.stub();

  //   emulateArgv(sandbox, 'cactus');

  //   await simpleCli(errorCallbackStub);

  //   const err = errorCallbackStub.getCall(0).args[0];

  //   expect(err.message).toEqual('Incorrect command specified');
  // });

  it('Failure with handler in the root', async () => {
    const entryStub = sandbox.stub(CommonFailureService.prototype, 'entry');

    await buildCli().execute(Clirio.split('cactus'));

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('Failure with handler in nested module', async () => {
    const entryStub = sandbox.stub(MigrationFailureService.prototype, 'entry');

    await buildCli().execute(Clirio.split('migration cactus'));

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('Failure without handler in nested module', async () => {
    const entryStub = sandbox.stub(CommonFailureService.prototype, 'entry');

    await buildCli().execute(Clirio.split('git cactus'));

    expect(entryStub.calledOnce).toBeTruthy();
  });
});
