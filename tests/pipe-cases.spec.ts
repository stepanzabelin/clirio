import { Clirio, ClirioHelper, ClirioValidationError } from '@clirio';
import sinon from 'sinon';
import {
  MigrationModule,
  MigrationUpOptionsDto,
  MigrationUpParamsDto,
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

    expect(input).toStrictEqual({
      dataType: 'params',
      scope: 'action',
      entity: MigrationUpParamsDto,
      rows: [
        {
          type: 'param',
          key: 'type-id',
          definedKeys: ['type-id'],
          value: '15135',
          propertyName: 'typeId',
          mapped: true,
        },
        {
          type: 'param',
          key: 'type-name',
          definedKeys: [],
          value: 'type-dbo',
          propertyName: null,
          mapped: false,
        },
      ],
    });
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

    expect(input).toStrictEqual({
      dataType: 'options',
      scope: 'action',
      entity: MigrationUpOptionsDto,
      rows: [
        {
          type: 'option',
          key: 'e',
          definedKeys: ['env', 'e'],
          value: ['DB_NAME=db-name', 'DB_TABLE=db-table'],
          propertyName: 'envs',
          mapped: true,
        },
        {
          type: 'option',
          key: 's',
          definedKeys: ['silent', 's'],
          value: null,
          propertyName: 'silent',
          mapped: true,
        },
        {
          type: 'option',
          key: 'id',
          definedKeys: ['id', 'i'],
          value: '149542',
          propertyName: 'id',
          mapped: true,
        },
        {
          type: 'option',
          key: 'start-date',
          definedKeys: ['start-date', 'b'],
          value: '1',
          propertyName: 'startDate',
          mapped: true,
        },
        {
          type: 'option',
          key: 'end-date',
          definedKeys: ['end-date', 'e'],
          value: null,
          propertyName: 'endDate',
          mapped: true,
        },
        {
          type: 'option',
          key: 'algorithm',
          definedKeys: ['algorithm', 'a'],
          value: 'a',
          propertyName: 'algorithm',
          mapped: true,
        },
      ],
    });
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

    const [, inputParams] = pipeStub.getCall(0).args;
    const [, inputOptions] = pipeStub.getCall(1).args;

    expect(
      ClirioHelper.formatKeysFromPipeContext(inputParams, 'typeId'),
    ).toEqual('<type-id>');

    expect(
      ClirioHelper.formatKeysFromPipeContext(inputParams, 'type-name'),
    ).toEqual('<type-name>');

    expect(
      ClirioHelper.formatKeysFromPipeContext(inputOptions, 'envs'),
    ).toEqual('--env, -e');

    expect(
      ClirioHelper.formatKeysFromPipeContext(inputOptions, 'silent'),
    ).toEqual('--silent, -s');

    expect(ClirioHelper.formatKeysFromPipeContext(inputOptions, 'id')).toEqual(
      '--id, -i',
    );

    expect(
      ClirioHelper.formatKeysFromPipeContext(inputOptions, 'algorithm'),
    ).toEqual('--algorithm, -a');
  });
});
