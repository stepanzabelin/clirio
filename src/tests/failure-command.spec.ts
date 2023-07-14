import sinon from 'sinon';
import { cliApp } from '../test-cli-app/cli-app';
import { CommonFailureService } from '../test-cli-app/modules/common/failure';
import { MigrationFailureService } from '../test-cli-app/modules/migration/failure';
import { emulateArgv } from '../test-env/utils/emulateArgv';

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

    emulateArgv(sandbox, 'cactus');
    await cliApp();

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('Failure with handler in nested module', async () => {
    const entryStub = sandbox.stub(MigrationFailureService.prototype, 'entry');

    emulateArgv(sandbox, 'migration cactus');
    await cliApp();

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('Failure without handler in nested module', async () => {
    const entryStub = sandbox.stub(CommonFailureService.prototype, 'entry');

    emulateArgv(sandbox, 'git cactus');
    await cliApp();

    expect(entryStub.calledOnce).toBeTruthy();
  });
});
