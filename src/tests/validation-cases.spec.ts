import { Clirio } from '@clirio';
import sinon from 'sinon';
import { MigrationModule } from '../test-cli-app/modules/migration';
import { HelloModule } from '../test-cli-app/modules/hello';

const buildCli = () => {
  const cli = new Clirio();
  cli.setModules([HelloModule, MigrationModule]);
  return cli;
};

describe('Validation cases', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('Test 1.1. Positive', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'from');

    await buildCli().execute(
      Clirio.split(
        'migration from 1567 type-dbo -e DB_NAME=db-name -e DB_TABLE=db-table --id=149542 -s --start-date=1 --algorithm=a',
      ),
    );

    const [params, options] = entryStub.getCall(0).args;

    expect(params).toStrictEqual({
      typeId: '1567',
      typeName: 'type-dbo',
    });

    expect(options).toStrictEqual({
      envs: ['DB_NAME=db-name', 'DB_TABLE=db-table'],
      silent: null,
      id: '149542',
      startDate: '1',
      algorithm: 'a',
    });
  });

  // it('Test 2.2. Positive', async () => {
  //   const entryStub = sandbox.stub(MigrationModule.prototype, 'to');

  //   await buildCli().execute(
  //     Clirio.split(
  //       'migration to 7691 --env DB_NAME=db-name -e DB_TABLE=db-table -i 149542 -s',
  //     ),
  //   );

  //   const [params, options] = entryStub.getCall(0).args;

  //   expect(params).toStrictEqual({
  //     typeId: 7691,
  //   });

  //   expect(options).toStrictEqual({
  //     envs: { DB_NAME: 'db-name', DB_TABLE: 'db-table' },
  //     id: 149542,
  //     silent: true,
  //   });
  // });
});
