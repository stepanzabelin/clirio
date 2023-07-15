import sinon from 'sinon';
import { Clirio } from '@clirio';
import { CheckService } from '../test-cli-app/modules/common/check';
import { CommonModule } from '../test-cli-app/modules/common/common.module';
import { VersionService } from '../test-cli-app/modules/common/version';

const buildCli = () => {
  const cli = new Clirio();
  cli.setModules([CommonModule]);
  return cli;
};

describe('Command as option', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('Test #1', async () => {
    const entryStub = sandbox.stub(VersionService.prototype, 'entry');

    await buildCli().execute(Clirio.split('-v'));

    expect(entryStub.calledOnce).toBeTruthy();

    entryStub.restore();
  });

  it('Test #2', async () => {
    const entryStub = sandbox.stub(VersionService.prototype, 'entry');

    await buildCli().execute(Clirio.split('--version'));

    expect(entryStub.calledOnce).toBeTruthy();

    entryStub.restore();
  });

  it('Test #3', async () => {
    const entryStub = sandbox.stub(CheckService.prototype, 'entry');

    await buildCli().execute(Clirio.split('--check --pool=5 -v'));

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      verbose: null,
      pool: '5',
    });

    entryStub.restore();
  });

  it('Test #4', async () => {
    const entryStub = sandbox.stub(CheckService.prototype, 'entry');

    await buildCli().execute(Clirio.split('--check --unknown --pool=5 -v'));

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      verbose: null,
      unknown: null,
      pool: '5',
    });

    entryStub.restore();
  });

  // it('invalid input command as option and extra options', async () => {
  //   const errorCallbackStub = sinon.stub();

  //   emulateArgv(sandbox, '--check --unknown --pool=5 -v');
  //   await cliApp(errorCallbackStub);

  //   const err = errorCallbackStub.getCall(0).args[0];

  //   expect(err.message).toEqual('"unknown" is not allowed');
  // });
});
