import sinon from 'sinon';
import { cliApp } from '../test-cli-app/cli-app';
import { CommonEmptyService } from '../test-cli-app/modules/common/empty';
import { CommonFailureService } from '../test-cli-app/modules/common/failure';
import { MigrationEmptyService } from '../test-cli-app/modules/migration/empty';
import { emulateArgv } from '../test-env/utils/emulateArgv';

describe('Empty command', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  // it('Empty without handler', async () => {
  //   const globalExceptionCatch = sinon.stub();

  //   emulateArgv(sandbox, '');

  //   await cliApp({ globalExceptionCatch });

  //   const err = globalExceptionCatch.getCall(0).args[0];

  //   expect(err.message).toEqual('Incorrect command specified');
  // });

  it('Empty with handler in the root', async () => {
    const entryStub = sandbox.stub(CommonEmptyService.prototype, 'entry');

    emulateArgv(sandbox, '');
    await cliApp();

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('Empty with handler in nested module', async () => {
    const entryStub = sandbox.stub(MigrationEmptyService.prototype, 'entry');

    emulateArgv(sandbox, 'migration');
    await cliApp();

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('Empty without handler in nested module', async () => {
    const entryStub = sandbox.stub(CommonFailureService.prototype, 'entry');

    emulateArgv(sandbox, 'git');
    await cliApp();

    expect(entryStub.calledOnce).toBeTruthy();
  });
});
