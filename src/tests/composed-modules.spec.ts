import sinon from 'sinon';
import { Clirio } from '@clirio';
import { HelloModule } from '../test-cli-app/modules/hello';
import { GitModule } from '../test-cli-app/modules/git';
import { MigrationModule } from '../test-cli-app/modules/migration';
import { PingModule } from '../test-cli-app/modules/ping';
import { CommonModule } from '../test-cli-app/modules/common/common.module';

const buildCli = () => {
  const cli = new Clirio();
  cli.setModules([
    HelloModule,
    GitModule,
    new MigrationModule(),
    PingModule,
    new CommonModule(),
  ]);
  return cli;
};

describe('Composed of several modules', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('1.1', async () => {
    const entrySpy = sandbox.stub(HelloModule.prototype, 'helloThere');

    await buildCli().execute(Clirio.split('hello there'));

    expect(entrySpy.calledOnce).toBeTruthy();
  });

  it('2.1', async () => {
    const entrySpy = sandbox.stub(GitModule.prototype, 'status');

    await buildCli().execute(Clirio.split('git status'));

    expect(entrySpy.calledOnce).toBeTruthy();
  });

  it('3.1', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'status');

    await buildCli().execute(
      Clirio.split(
        'migration status users --id=17 -d 22.12.22 -f A --format B --verbose',
      ),
    );

    const [params, options] = entryStub.getCall(0).args;

    expect(params).toStrictEqual({ tables: 'users' });

    expect(options).toStrictEqual({
      id: ['17'],
      d: '22.12.22',
      format: 'A',
      silent: null,
    });
  });

  it('4.1', async () => {
    const entryStub = sandbox.stub(CommonModule.prototype, 'check');

    await buildCli().execute(Clirio.split('--check --pool=7 -v'));

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      verbose: null,
      pool: '7',
    });
  });
});
