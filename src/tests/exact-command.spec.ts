import sinon from 'sinon';
import { CommonFailureService } from '../test-cli-app/modules/common/failure';
import { HelloThereService } from '../test-cli-app/modules/hello/hello-there';
import { cliApp } from '../test-cli-app/cli-app';
import { emulateArgv } from '../test-env/utils/emulateArgv';

describe('Exact command', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('correct input compound command', async () => {
    const entryStub = sandbox.stub(HelloThereService.prototype, 'entry');

    emulateArgv(sandbox, 'hello there');
    await cliApp();

    expect(entryStub.calledOnce).toBeTruthy();

    entryStub.restore();
  });

  // it('correct input simple command with extra option without options dto', async () => {
  //   const entryStub = sandbox.stub(HelloThereService.prototype, 'entry');

  //   emulateArgv(sandbox, 'hello there --name=Alex');
  //   await cliApp();

  //   expect(entryStub.calledOnce).toBeTruthy();
  // });

  it('invalid input simple command with extra param', async () => {
    const entryStub = sandbox.stub(CommonFailureService.prototype, 'entry');

    emulateArgv(sandbox, 'hello Alex');
    await cliApp();

    expect(entryStub.calledOnce).toBeTruthy();
  });

  // it('invalid input compound command with extra param', async () => {
  //   const globalExceptionCatch = sinon.stub();

  //   emulateArgv(sandbox, 'ping ping');

  //   await cliApp({ globalExceptionCatch });

  //   const err = globalExceptionCatch.getCall(0).args[0];

  //   expect(err.message).toEqual('Incorrect command specified');
  // });
});
