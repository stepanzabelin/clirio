import { Clirio } from '@clirio';
import sinon from 'sinon';
import { cliApp } from '../test-cli-app/cli-app';
import { HelloModule } from '../test-cli-app/modules/hello';
import { MigrationRunService } from '../test-cli-app/modules/migration/migration-run';

const buildCli = () => {
  const cli = new Clirio();
  cli.setModules([HelloModule]);
  return cli;
};

describe('Options with variable', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('correct input long and short variables', async () => {
    const entryStub = sandbox.stub(MigrationRunService.prototype, 'entry');

    await buildCli().execute(
      Clirio.split(
        'migration run -e DB_NAME=db-name --env DB_USER=db-user --silent',
      ),
    );

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      envs: { DB_USER: 'db-user', DB_NAME: 'db-name' },
      silent: null,
    });

    entryStub.restore();
  });

  it('correct input only one variable', async () => {
    const entryStub = sandbox.stub(MigrationRunService.prototype, 'entry');

    await buildCli().execute(
      Clirio.split('migration run -e DB_NAME=db-name --silent'),
    );

    await cliApp();

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      envs: { DB_NAME: 'db-name' },
      silent: null,
    });

    entryStub.restore();
  });

  it('correct input only one variable 2', async () => {
    const entryStub = sandbox.stub(MigrationRunService.prototype, 'entry');

    await buildCli().execute(Clirio.split('migration run'));

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({});

    entryStub.restore();
  });
});
