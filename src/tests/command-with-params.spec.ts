import sinon from 'sinon';
import { cliApp } from '../test-env/cli-app/cliApp';
import { emulateArgv } from '../test-env/utils/emulateArgv';
import { CommonFailureService } from '../test-env/cli-app/modules/common/failure';
import { HelloToService } from '../test-env/cli-app/modules/hello/helloTo';

describe('Command with params', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('correct input: hello-to firstName last-name', async () => {
    const fnSpy = sandbox.stub(HelloToService.prototype, 'entry');

    emulateArgv(sandbox, 'hello to Alex Smith');
    await cliApp();

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
    await cliApp({ config: { allowUncontrolledOptions: true } });

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

    await cliApp();

    expect(entryStub.calledOnce).toBeTruthy();
  });
});
