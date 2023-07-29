import { Clirio, ClirioValidationError } from '@clirio';
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

  it('1.1 Params and options are corrected', async () => {
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

  it('1.2 / Params are corrected, options are invalid', async () => {
    const err = await buildCli()
      .execute(
        Clirio.split(
          'migration from 1567 type-dbo -e DB_NAME=db-name --id=fdfd -s --start-date=1 --algorithm=a',
        ),
      )
      .catch((err) => err);

    expect(err instanceof ClirioValidationError).toBeTruthy();
    expect(err).toMatchObject({
      propertyName: 'id',
      dataType: 'options',
    });
  });

  it('1.3 / Params are invalid, options are corrected', async () => {
    const err = await buildCli()
      .execute(
        Clirio.split(
          'migration from t1567 type-dbo -e DB_NAME=db-name -e DB_TABLE=db-table --id="cat" -s --start-date=1 --algorithm=a',
        ),
      )
      .catch((err) => err);

    expect(err instanceof ClirioValidationError).toBeTruthy();
    expect(err).toMatchObject({
      propertyName: 'typeId',
      dataType: 'params',
    });
  });

  it('1.4 / Params are invalid, options are invalid', async () => {
    const err = await buildCli()
      .execute(
        Clirio.split(
          'migration from t1567 type-dbo -e DB_NAME=db-name -e DB_TABLE=db-table --id="cat" -s --start-date=1 --algorithm=a',
        ),
      )
      .catch((err) => err);

    expect(err instanceof ClirioValidationError).toBeTruthy();
    expect(err).toMatchObject({
      propertyName: 'typeId',
      dataType: 'params',
    });
  });
});
