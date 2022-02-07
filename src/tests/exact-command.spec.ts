import sinon from 'sinon';
import { CommonFailureService } from '../test-env/complex-cli/modules/common/failure';
import { HelloThereService } from '../test-env/complex-cli/modules/hello/hello-there';
import { complexCli } from '../test-env/complex-cli/complexCli';
import { simpleCli } from '../test-env/simple-cli/simpleCli';
import { emulateArgv } from '../test-env/utils/emulateArgv';

describe('Exact command', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('correct input compound command', () => {
    const entryStub = sandbox.stub(HelloThereService.prototype, 'entry');

    emulateArgv(sandbox, 'hello there');
    complexCli();

    expect(entryStub.calledOnce).toBeTruthy();

    entryStub.restore();
  });

  it('correct input simple command with extra option without options dto', () => {
    const entryStub = sandbox.stub(HelloThereService.prototype, 'entry');

    emulateArgv(sandbox, 'hello there --name=Alex');
    complexCli();

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('invalid input simple command with extra param', () => {
    const entryStub = sandbox.stub(CommonFailureService.prototype, 'entry');

    emulateArgv(sandbox, 'hello Alex');
    complexCli();

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('invalid input compound command with extra param', () => {
    const errorCallbackStub = sinon.stub();

    emulateArgv(sandbox, 'ping ping');

    simpleCli(errorCallbackStub);

    const err = errorCallbackStub.getCall(0).args[0];

    expect(err.message).toEqual('Incorrect command specified');
  });
});
