import { Clirio } from '@clirio';
import sinon from 'sinon';
import { HelloModule } from '../test-cli-app/modules/hello';
import { MigrationModule } from '../test-cli-app/modules/migration';
import { CommonModule } from '../test-cli-app/modules/common/common.module';
import { GitModule } from '../test-cli-app/modules/git';
import { PingModule } from '../test-cli-app/modules/ping';

const buildCli = () => {
  const cli = new Clirio();
  cli.setModules([
    HelloModule,
    MigrationModule,
    CommonModule,
    GitModule,
    PingModule,
  ]);
  return cli;
};

describe('Failure command', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('1.1 / Positive', async () => {
    const entryStub = sandbox.stub(CommonModule.prototype, 'failure');

    await buildCli().execute(Clirio.split('cactus'));

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('1.2 / Positive', async () => {
    const entryStub = sandbox.stub(CommonModule.prototype, 'failure');

    await buildCli().execute(Clirio.split('git cactus'));

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('1.3 / Positive', async () => {
    const entryStub = sandbox.stub(CommonModule.prototype, 'failure');

    await buildCli().execute(Clirio.split('git'));

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('1.4 / Positive', async () => {
    const entryStub = sandbox.stub(CommonModule.prototype, 'failure');

    await buildCli().execute(Clirio.split('git migration'));

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('2.1 / Positive', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'failure');

    await buildCli().execute(Clirio.split('migration cactus'));

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('2.2 / Positive', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'failure');

    await buildCli().execute(Clirio.split('migration migration git'));

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('2.3 / Positive', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'failure');

    await buildCli().execute(Clirio.split('migration git'));

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('3.3 / Positive', async () => {
    const entryStub = sandbox.stub(PingModule.prototype, 'failure');

    await buildCli().execute(Clirio.split('ping check'));

    expect(entryStub.calledOnce).toBeTruthy();
  });
});
