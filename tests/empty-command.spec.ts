import { Clirio } from '@clirio';
import sinon from 'sinon';
import { MigrationModule } from '../test-cli-app/modules/migration';
import { CommonModule } from '../test-cli-app/modules/common';
import { HelloModule } from '../test-cli-app/modules/hello';
import { GitModule } from '../test-cli-app/modules/git';
import { PingModule } from '../test-cli-app/modules/ping';

const buildCli = () => {
  const cli = new Clirio();
  cli.setModules([
    MigrationModule,
    HelloModule,
    CommonModule,
    GitModule,
    PingModule,
  ]);
  return cli;
};

describe('Empty command', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('1.1', async () => {
    const entryStub = sandbox.stub(CommonModule.prototype, 'empty');

    await buildCli().execute(Clirio.split(''));

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('1.2', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'empty');

    await buildCli().execute(Clirio.split('migration'));

    expect(entryStub.calledOnce).toBeTruthy();
  });

  it('1.3', async () => {
    const entryStub = sandbox.stub(PingModule.prototype, 'empty');

    await buildCli().execute(Clirio.split('ping'));

    expect(entryStub.calledOnce).toBeTruthy();
  });
});
