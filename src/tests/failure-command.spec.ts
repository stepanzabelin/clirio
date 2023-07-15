import { Clirio } from '@clirio';
import sinon from 'sinon';
import { HelloModule } from '../test-cli-app/modules/hello';
import { MigrationModule } from '../test-cli-app/modules/migration';
import { CommonModule } from '../test-cli-app/modules/common/common.module';
import { GitModule } from '../test-cli-app/modules/git';

const buildCli = () => {
  const cli = new Clirio();
  cli.setModules([HelloModule, MigrationModule, CommonModule, GitModule]);
  return cli;
};

describe('Failure command', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  // it('Failure without handler', async () => {
  //   const errorCallbackStub = sinon.stub();

  //   emulateArgv(sandbox, 'cactus');

  //   await simpleCli(errorCallbackStub);

  //   const err = errorCallbackStub.getCall(0).args[0];

  //   expect(err.message).toEqual('Incorrect command specified');
  // });

  it('Failure with handler in the root', async () => {
    const entryStub = sandbox.stub(CommonModule.prototype, 'failure');

    await buildCli()
      .execute(Clirio.split('cactus'))
      .catch((err) => null);

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('Failure with handler in nested module', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'failure');

    await buildCli()
      .execute(Clirio.split('migration cactus'))
      .catch(() => null);

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('Failure without handler in nested module', async () => {
    const entryStub = sandbox.stub(CommonModule.prototype, 'failure');

    await buildCli()
      .execute(Clirio.split('git cactus'))
      .catch(() => null);

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('Empty without handler in nested module', async () => {
    const entryStub = sandbox.stub(CommonModule.prototype, 'failure');

    await buildCli()
      .execute(Clirio.split('git'))
      .catch(() => null);

    expect(entryStub.calledOnce).toBeTruthy();
  });
});
