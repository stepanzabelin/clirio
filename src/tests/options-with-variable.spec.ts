import { Clirio } from '@clirio';
import sinon from 'sinon';
import { MigrationModule } from '../test-cli-app/modules/migration';
import { HelloModule } from '../test-cli-app/modules/hello';

const buildCli = () => {
  const cli = new Clirio();
  cli.setModules([HelloModule, MigrationModule]);
  return cli;
};

describe('Options with variable', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  // it('correct input long and short variables', async () => {
  //   const entryStub = sandbox.stub(MigrationRunService.prototype, 'entry');

  //   await buildCli().execute(
  //     Clirio.split(
  //       'migration run -e DB_NAME=db-name --env DB_USER=db-user --silent',
  //     ),
  //   );

  //   const [options] = entryStub.getCall(0).args;

  //   expect(options).toStrictEqual({
  //     envs: { DB_USER: 'db-user', DB_NAME: 'db-name' },
  //     silent: null,
  //   });

  //
  // });

  it('correct input only one variable', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'run');

    await buildCli().execute(
      Clirio.split('migration run -e DB_NAME=db-name --silent'),
    );

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      envs: { DB_NAME: 'db-name' },
      silent: null,
    });
  });

  it('correct input only one variable 2', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'run');

    await buildCli().execute(Clirio.split('migration run'));

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({});
  });
});
