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

  it('correct input compound command', async () => {
    const entryStub = sandbox.stub(HelloThereService.prototype, 'entry');

    emulateArgv(sandbox, 'hello there');
    await complexCli();

    expect(entryStub.calledOnce).toBeTruthy();

    entryStub.restore();
  });

  it('correct input simple command with extra option without options dto', async () => {
    const entryStub = sandbox.stub(HelloThereService.prototype, 'entry');

    emulateArgv(sandbox, 'hello there --name=Alex');
    await complexCli();

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('invalid input simple command with extra param', async () => {
    const entryStub = sandbox.stub(CommonFailureService.prototype, 'entry');

    emulateArgv(sandbox, 'hello Alex');
    await complexCli();

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('invalid input compound command with extra param', async () => {
    const errorCallbackStub = sinon.stub();

    emulateArgv(sandbox, 'ping ping');

    await simpleCli(errorCallbackStub);

    const err = errorCallbackStub.getCall(0).args[0];

    expect(err.message).toEqual('Incorrect command specified');
  });
});
