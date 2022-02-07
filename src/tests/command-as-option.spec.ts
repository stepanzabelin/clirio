import sinon from 'sinon';
import { complexCli } from '../test-env/complex-cli/complexCli';
import { CheckService } from '../test-env/complex-cli/modules/common/check';
import { VersionService } from '../test-env/complex-cli/modules/common/version';
import { emulateArgv } from '../test-env/utils/emulateArgv';

describe('Command as option', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('correct input version, short options', () => {
    const entryStub = sandbox.stub(VersionService.prototype, 'entry');

    emulateArgv(sandbox, '-v');
    complexCli();

    expect(entryStub.calledOnce).toBeTruthy();

    entryStub.restore();
  });

  it('correct input version, short options', () => {
    const entryStub = sandbox.stub(VersionService.prototype, 'entry');

    emulateArgv(sandbox, '--version');
    complexCli();

    expect(entryStub.calledOnce).toBeTruthy();

    entryStub.restore();
  });

  it('correct input command as option and extra options', () => {
    const entryStub = sandbox.stub(CheckService.prototype, 'entry');

    emulateArgv(sandbox, '--check --pool=5 -v');
    complexCli();

    const [options] = entryStub.getCall(0).args;

    expect(options).toMatchObject({
      verbose: true,
      pool: 5,
    });

    entryStub.restore();
  });

  it('invalid input command as option and extra options', () => {
    const errorCallbackStub = sinon.stub();

    emulateArgv(sandbox, '--check --unknown --pool=5 -v');
    complexCli(errorCallbackStub);

    const err = errorCallbackStub.getCall(0).args[0];

    expect(err.message).toEqual('"unknown" is not allowed');
  });
});
