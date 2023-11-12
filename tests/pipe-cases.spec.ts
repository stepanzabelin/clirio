import { Clirio, ClirioHelper, ClirioValidationError } from '@clirio';
import sinon from 'sinon';
import {
  MigrationModule,
  MigrationUpPipe,
} from '../test-cli-app/modules/migration';
import { WeatherModule } from '../test-cli-app/modules/weather';

const buildCli = () => {
  const cli = new Clirio();
  cli.setModules([MigrationModule, WeatherModule]);
  return cli;
};

describe('Pipe cases', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('1.1', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'up');

    await buildCli().execute(
      Clirio.split(
        'migration up type-dbo 15135 -e DB_NAME=db-name -e DB_TABLE=db-table --id=149542 -s --start-date=1 --end-date --algorithm=a',
      ),
    );

    const [params, options] = entryStub.getCall(0).args;

    expect(params).toStrictEqual({ typeId: '15135', 'type-name': 'type-dbo' });

    expect(options).toStrictEqual({
      envs: ['DB_NAME=db-name', 'DB_TABLE=db-table'],
      silent: null,
      id: '149542',
      startDate: '1',
      endDate: null,
      algorithm: 'a',
    });
  });

  it('1.2', async () => {
    const pipeStub = sandbox.stub(MigrationUpPipe.prototype, 'transform');

    await buildCli().execute(
      Clirio.split(
        'migration up type-dbo 15135 -e DB_NAME=db-name -e DB_TABLE=db-table --id=149542 -s --start-date=1 --end-date --algorithm=a',
      ),
    );

    const [params, input] = pipeStub.getCall(0).args;

    expect(params).toStrictEqual({ typeId: '15135', 'type-name': 'type-dbo' });

    expect(
      ClirioHelper.getFormattedInputKey(input.entity, input.dataType, 'typeId'),
    ).toEqual('<type-id>');

    expect(
      ClirioHelper.getFormattedParamKey(input.entity, 'typeName'),
    ).toBeNull();
  });

  it('1.3', async () => {
    const pipeStub = sandbox.stub(MigrationUpPipe.prototype, 'transform');

    await buildCli().execute(
      Clirio.split(
        'migration up type-dbo 15135 -e DB_NAME=db-name -e DB_TABLE=db-table --id=149542 -s --start-date=1 --end-date --algorithm=a',
      ),
    );

    const [options, input] = pipeStub.getCall(1).args;

    expect(options).toStrictEqual({
      envs: ['DB_NAME=db-name', 'DB_TABLE=db-table'],
      silent: null,
      id: '149542',
      startDate: '1',
      endDate: null,
      algorithm: 'a',
    });

    expect(
      ClirioHelper.getFormattedInputKey(input.entity, input.dataType, 'test'),
    ).toBeNull();

    expect(
      ClirioHelper.getFormattedInputKey(input.entity, input.dataType, 'envs'),
    ).toEqual('--env, -e');

    expect(
      ClirioHelper.getFormattedInputKey(input.entity, input.dataType, 'silent'),
    ).toEqual('--silent, -s');

    expect(
      ClirioHelper.getFormattedInputKey(input.entity, input.dataType, 'id'),
    ).toEqual('--id, -i');

    expect(
      ClirioHelper.getFormattedInputKey(
        input.entity,
        input.dataType,
        'startDate',
      ),
    ).toEqual('--start-date, -b');

    expect(
      ClirioHelper.getFormattedInputKey(
        input.entity,
        input.dataType,
        'endDate',
      ),
    ).toEqual('--end-date, -e');

    expect(
      ClirioHelper.getFormattedOptionKey(input.entity, 'algorithm'),
    ).toEqual('--algorithm, -a');

    expect(
      ClirioHelper.getFormattedEnvKey(input.entity, 'algorithm'),
    ).toBeNull();
  });

  it('2.1', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'up');
    sandbox
      .stub(MigrationUpPipe.prototype, 'transform')
      .callsFake((data, input) => {
        if (input.dataType === 'params') {
          return {
            ...data,
            typeId: Number(data.typeId),
          };
        }

        if (input.dataType === 'options') {
          return {
            ...data,
            id: Number(data.id),
            silent: data.silent === null,
          };
        }

        return data;
      });

    await buildCli().execute(
      Clirio.split(
        'migration up type-dbo 15135 -e DB_NAME=db-name -e DB_TABLE=db-table --id=149542 -s --start-date=1 --end-date --algorithm=a',
      ),
    );

    const [params, options] = entryStub.getCall(0).args;

    expect(params).toStrictEqual({ typeId: 15135, 'type-name': 'type-dbo' });

    expect(options).toStrictEqual({
      envs: ['DB_NAME=db-name', 'DB_TABLE=db-table'],
      silent: true,
      id: 149542,
      startDate: '1',
      endDate: null,
      algorithm: 'a',
    });
  });

  it('3.1', async () => {
    sandbox
      .stub(MigrationUpPipe.prototype, 'transform')
      .callsFake((data, input) => {
        if (input.dataType === 'params') {
          throw new ClirioValidationError('"typeId" is wrong', {
            dataType: input.dataType,
            propertyName: 'typeId',
          });
        }

        return data;
      });

    const err = await buildCli()
      .execute(
        Clirio.split(
          'migration up type-dbo 15135 -e DB_NAME=db-name -e DB_TABLE=db-table --id=149542 -s --start-date=1 --end-date --algorithm=a',
        ),
      )
      .catch((err) => err);

    expect(err instanceof ClirioValidationError).toBeTruthy();
    expect(err).toMatchObject({
      propertyName: 'typeId',
      dataType: 'params',
    });
  });

  it('4.1', async () => {
    const pipeStub = sandbox.stub(MigrationUpPipe.prototype, 'transform');

    await buildCli().execute(
      Clirio.split(
        'migration up type-dbo 15135 -e DB_NAME=db-name -e DB_TABLE=db-table --id=149542 -s --start-date=1 --end-date --algorithm=a',
      ),
    );

    const [, input] = pipeStub.getCall(1).args;

    expect(
      ClirioHelper.getFormattedInputKey(input.entity, input.dataType, 'envs'),
    ).toEqual('--env, -e');

    expect(ClirioHelper.getFormattedOptionKey(input.entity, 'silent')).toEqual(
      '--silent, -s',
    );

    expect(ClirioHelper.getFormattedOptionKey(input.entity, 'id')).toEqual(
      '--id, -i',
    );

    expect(
      ClirioHelper.getFormattedOptionKey(input.entity, 'algorithm'),
    ).toEqual('--algorithm, -a');
  });
});
