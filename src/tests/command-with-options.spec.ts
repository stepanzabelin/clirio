import sinon from 'sinon';
import { complexCli } from '../test-env/complex-cli/complexCli';
import { HelloService } from '../test-env/complex-cli/modules/hello/hello';
import { emulateArgv } from '../test-env/utils/emulateArgv';

describe('Command with options', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('correct input', () => {
    const entryStub = sandbox.stub(HelloService.prototype, 'entry');

    emulateArgv(sandbox, 'hello --first-name=Alex --last-name=Smith');
    complexCli();

    const [options] = entryStub.getCall(0).args;

    expect(options).toMatchObject({
      firstName: 'Alex',
      lastName: 'Smith',
    });

    entryStub.restore();
  });

  it('invalid input with unknown option', () => {
    const errorCallbackStub = sinon.stub();

    emulateArgv(
      sandbox,
      'hello --first-name=Alex --last-name=Smith --middle-name=123'
    );

    complexCli(errorCallbackStub);

    const err = errorCallbackStub.getCall(0).args[0];

    expect(err.message).toEqual('"middle-name" is not allowed');
  });

  it('incorrect input', () => {
    const errorCallbackStub = sinon.stub();

    emulateArgv(sandbox, 'hello --first-name');
    complexCli();

    complexCli(errorCallbackStub);

    const err = errorCallbackStub.getCall(0).args[0];

    expect(err.message).toEqual('"--first-name, -f" must be a string');
  });
});
