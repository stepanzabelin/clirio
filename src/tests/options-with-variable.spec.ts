import sinon from 'sinon';
import { cliApp } from '../test-env/cli-app/cliApp';
import { MigrationRunService } from '../test-env/cli-app/modules/migration/migrationRun';
import { emulateArgv } from '../test-env/utils/emulateArgv';

describe('Options with variable', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('correct input long and short variables', async () => {
    const entryStub = sandbox.stub(MigrationRunService.prototype, 'entry');

    emulateArgv(
      sandbox,
      'migration run -e DB_NAME=db-name --env DB_USER=db-user --silent',
    );
    await cliApp();

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      envs: { DB_USER: 'db-user', DB_NAME: 'db-name' },
      silent: null,
    });

    entryStub.restore();
  });

  it('correct input only one variable', async () => {
    const entryStub = sandbox.stub(MigrationRunService.prototype, 'entry');

    emulateArgv(sandbox, 'migration run -e DB_NAME=db-name --silent');
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

    emulateArgv(sandbox, 'migration run');
    await cliApp();

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({});

    entryStub.restore();
  });
});
