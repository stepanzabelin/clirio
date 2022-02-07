import sinon from 'sinon';
import { complexCli } from '../test-env/complex-cli/complexCli';
import { CommonEmptyService } from '../test-env/complex-cli/modules/common/empty';
import { CommonFailureService } from '../test-env/complex-cli/modules/common/failure';
import { MigrationEmptyService } from '../test-env/complex-cli/modules/migration/empty';
import { simpleCli } from '../test-env/simple-cli/simpleCli';
import { emulateArgv } from '../test-env/utils/emulateArgv';

describe('Empty command', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('Empty without handler', () => {
    const errorCallbackStub = sinon.stub();

    emulateArgv(sandbox, '');

    simpleCli(errorCallbackStub);

    const err = errorCallbackStub.getCall(0).args[0];

    expect(err.message).toEqual('Incorrect command specified');
  });

  it('Empty with handler in the root', () => {
    const entryStub = sandbox.stub(CommonEmptyService.prototype, 'entry');

    emulateArgv(sandbox, '');
    complexCli();

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('Empty with handler in nested module', () => {
    const entryStub = sandbox.stub(MigrationEmptyService.prototype, 'entry');

    emulateArgv(sandbox, 'migration');
    complexCli();

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('Empty without handler in nested module', () => {
    const entryStub = sandbox.stub(CommonFailureService.prototype, 'entry');

    emulateArgv(sandbox, 'git');
    complexCli();

    expect(entryStub.calledOnce).toBeTruthy();
  });
});
