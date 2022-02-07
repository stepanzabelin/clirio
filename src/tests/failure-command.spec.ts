import sinon from 'sinon';
import { complexCli } from '../test-env/complex-cli/complexCli';
import { CommonFailureService } from '../test-env/complex-cli/modules/common/failure';
import { MigrationFailureService } from '../test-env/complex-cli/modules/migration/failure';
import { simpleCli } from '../test-env/simple-cli/simpleCli';
import { emulateArgv } from '../test-env/utils/emulateArgv';

describe('Failure command', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('Failure without handler', () => {
    const errorCallbackStub = sinon.stub();

    emulateArgv(sandbox, 'cactus');

    simpleCli(errorCallbackStub);

    const err = errorCallbackStub.getCall(0).args[0];

    expect(err.message).toEqual('Incorrect command specified');
  });

  it('Failure with handler in the root', () => {
    const entryStub = sandbox.stub(CommonFailureService.prototype, 'entry');

    emulateArgv(sandbox, 'cactus');
    complexCli();

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('Failure with handler in nested module', () => {
    const entryStub = sandbox.stub(MigrationFailureService.prototype, 'entry');

    emulateArgv(sandbox, 'migration cactus');
    complexCli();

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('Failure without handler in nested module', () => {
    const entryStub = sandbox.stub(CommonFailureService.prototype, 'entry');

    emulateArgv(sandbox, 'git cactus');
    complexCli();

    expect(entryStub.calledOnce).toBeTruthy();
  });
});
