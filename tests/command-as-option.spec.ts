import sinon from 'sinon';
import { Clirio } from '@clirio';
import { CommonModule } from '../test-cli-app/modules/common/common.module';

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

  it('1.1', async () => {
    const entryStub = sandbox.stub(CommonModule.prototype, 'version');

    await buildCli().execute(Clirio.split('-v'));

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('1.2', async () => {
    const entryStub = sandbox.stub(CommonModule.prototype, 'version');

    await buildCli().execute(Clirio.split('--version'));

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('2.1', async () => {
    const entryStub = sandbox.stub(CommonModule.prototype, 'check');

    await buildCli().execute(Clirio.split('--check --pool=5 -v'));

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      verbose: null,
      pool: '5',
    });
  });

  it('2.2', async () => {
    const entryStub = sandbox.stub(CommonModule.prototype, 'check');

    await buildCli().execute(
      Clirio.split('--check --unknown --pool=5 -v --test-arg=1'),
    );

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      verbose: null,
      unknown: null,
      pool: '5',
      'test-arg': '1',
    });
  });
});
