import { Clirio } from '@clirio';
import sinon from 'sinon';
import { MigrationModule } from '../test-cli-app/modules/migration';
import { HelloModule } from '../test-cli-app/modules/hello';

const buildCli = () => {
  const cli = new Clirio();
  cli.setModules([HelloModule, MigrationModule]);
  return cli;
};

describe('Transformation cases', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('1.1', async () => {
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

  it('1.2', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'run');

    await buildCli().execute(
      Clirio.split(
        'migration run -e DB_NAME=db-name -e DB_TABLE=db-table --env DB_PASSWORD=123456 --silent',
      ),
    );

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      envs: { DB_NAME: 'db-name', DB_TABLE: 'db-table', DB_PASSWORD: '123456' },
      silent: null,
    });
  });

  it('1.3', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'run');

    await buildCli().execute(Clirio.split('migration run -s'));

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({ silent: null, envs: {} });
  });

  it('2.1', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'to');

    await buildCli().execute(
      Clirio.split(
        'migration to 1567 dbo -e DB_NAME=db-name -e DB_TABLE=db-table --id=149542 --s',
      ),
    );

    const [params, options] = entryStub.getCall(0).args;

    expect(params).toStrictEqual({
      typeId: 1567,
      typeName: 'type-dbo',
    });

    expect(options).toStrictEqual({
      id: 149542,
      envs: { DB_NAME: 'db-name', DB_TABLE: 'db-table' },
      silent: true,
      algorithm: null,
    });
  });

  it('2.2', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'to');

    await buildCli().execute(
      Clirio.split(
        'migration to 7691 dbo --env DB_NAME=db-name -e DB_TABLE=db-table -i 149542 -s',
      ),
    );

    const [params, options] = entryStub.getCall(0).args;

    expect(params).toStrictEqual({
      typeId: 7691,
      typeName: 'type-dbo',
    });

    expect(options).toStrictEqual({
      envs: { DB_NAME: 'db-name', DB_TABLE: 'db-table' },
      id: 149542,
      silent: true,
      algorithm: null,
    });
  });

  it('2.3', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'to');

    await buildCli().execute(
      Clirio.split(
        'migration to 7691 dbo -e DB_USER --env DB_NAME=db-name -e DB_TABLE=db-table --env DB_SSL --env DB_PASS= -i 149542 -s',
      ),
    );

    const [params, options] = entryStub.getCall(0).args;

    expect(params).toStrictEqual({
      typeId: 7691,
      typeName: 'type-dbo',
    });

    expect(options).toStrictEqual({
      envs: {
        DB_USER: null,
        DB_TABLE: 'db-table',
        DB_NAME: 'db-name',
        DB_SSL: null,
        DB_PASS: '',
      },
      id: 149542,
      silent: true,
      algorithm: null,
    });
  });
});
