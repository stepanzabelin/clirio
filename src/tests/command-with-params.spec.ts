import sinon from 'sinon';
import { complexCli } from '../test-env/complex-cli/complexCli';
import { emulateArgv } from '../test-env/utils/emulateArgv';
import { CommonFailureService } from '../test-env/complex-cli/modules/common/failure';
import { HelloToService } from '../test-env/complex-cli/modules/hello/helloTo';

describe('Command with params', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('correct input: hello-to firstName last-name', async () => {
    const fnSpy = sandbox.stub(HelloToService.prototype, 'entry');

    emulateArgv(sandbox, 'hello to Alex Smith');
    await complexCli();

    const [params] = fnSpy.getCall(0).args;

    expect(params).toStrictEqual({
      firstName: 'Alex',
      'last-name': 'Smith',
    });

    fnSpy.restore();
  });

  it('correct input extra option in command with masks without options dto', async () => {
    const fnSpy = sandbox.stub(HelloToService.prototype, 'entry');

    emulateArgv(sandbox, 'hello to Alex Smith --no-middle-name');
    await complexCli();

    const [params] = fnSpy.getCall(0).args;

    expect(params).toStrictEqual({
      firstName: 'Alex',
      'last-name': 'Smith',
    });

    fnSpy.restore();
  });

  it('invalid input extra param', async () => {
    const entryStub = sandbox.stub(CommonFailureService.prototype, 'entry');

    emulateArgv(sandbox, 'hello Alex');

    await complexCli();

    expect(entryStub.calledOnce).toBeTruthy();
  });
});
