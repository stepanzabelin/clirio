import sinon from 'sinon';
import { complexCli } from '../test-env/complex-cli/complexCli';
import { MigrationRunService } from '../test-env/complex-cli/modules/migration/migrationRun';
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
      'migration run -e DB_NAME=db-name --env DB_USER=db-user --silent'
    );
    await complexCli();

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
    await complexCli();

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      envs: { DB_NAME: 'db-name' },
      silent: null,
    });

    entryStub.restore();
  });

  it('correct input only one variable', async () => {
    const entryStub = sandbox.stub(MigrationRunService.prototype, 'entry');

    emulateArgv(sandbox, 'migration run');
    await complexCli();

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({});

    entryStub.restore();
  });
});
