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

  it('correct input: hello-to firstName last-name', () => {
    const fnSpy = sandbox.stub(HelloToService.prototype, 'entry');

    emulateArgv(sandbox, 'hello to Alex Smith');
    complexCli();

    const [params] = fnSpy.getCall(0).args;

    expect(params).toMatchObject({
      firstName: 'Alex',
      'last-name': 'Smith',
    });

    fnSpy.restore();
  });

  it('correct input extra option in command with masks without options dto', () => {
    const fnSpy = sandbox.stub(HelloToService.prototype, 'entry');

    emulateArgv(sandbox, 'hello to Alex Smith --no-middle-name');
    complexCli();

    const [params] = fnSpy.getCall(0).args;

    expect(params).toMatchObject({
      firstName: 'Alex',
      'last-name': 'Smith',
    });

    fnSpy.restore();
  });

  it('invalid input extra param', () => {
    const entryStub = sandbox.stub(CommonFailureService.prototype, 'entry');

    emulateArgv(sandbox, 'hello Alex');

    complexCli();

    expect(entryStub.calledOnce).toBeTruthy();
  });
});
