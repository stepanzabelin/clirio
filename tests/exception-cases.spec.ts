import sinon from 'sinon';
import { Clirio, ClirioCommonError, ClirioValidationError } from '@clirio';
import { HelloModule } from '../test-cli-app/modules/hello';
import {
  MigrationModule,
  MigrationUpPipe,
} from '../test-cli-app/modules/migration';

const buildCli = () => {
  const cli = new Clirio();
  cli.setModules([HelloModule]);
  return cli;
};

describe('Command with params', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('2.1', async () => {
    const catchSpy = sandbox.spy();

    await buildCli()
      .setGlobalFilter({
        catch: catchSpy,
      })
      .execute(Clirio.split('hello jupiter'))
      .catch(() => null);

    const [err] = catchSpy.getCall(0).args;

    expect(
      err instanceof ClirioCommonError && err.code === 'INCORRECT_COMMAND',
    ).toBeTruthy();
  });

  it('2.2', async () => {
    const catchSpy = sandbox.spy();

    await buildCli()
      .setGlobalFilter({
        catch: catchSpy,
      })
      .execute(Clirio.split('hello to Alex'))
      .catch(() => null);

    const [err] = catchSpy.getCall(0).args;

    expect(
      err instanceof ClirioCommonError && err.code === 'INCORRECT_COMMAND',
    ).toBeTruthy();
  });

  it('2.3', async () => {
    const catchSpy = sandbox.spy();

    await buildCli()
      .setGlobalFilter({
        catch: catchSpy,
      })
      .execute(Clirio.split('hello to Alex Smith Junior'))
      .catch(() => null);

    const [err] = catchSpy.getCall(0).args;

    expect(
      err instanceof ClirioCommonError && err.code === 'INCORRECT_COMMAND',
    ).toBeTruthy();
  });

  it('2.4 / Global', async () => {
    const catchSpy = sandbox.spy();

    await buildCli()
      .setGlobalFilter({
        catch: catchSpy,
      })
      .execute(Clirio.split('hello to'))
      .catch(() => null);

    const [err] = catchSpy.getCall(0).args;

    expect(
      err instanceof ClirioCommonError && err.code === 'INCORRECT_COMMAND',
    ).toBeTruthy();
  });

  it('3.1 / Global exception with action pipe', async () => {
    const catchSpy = sandbox.spy();

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

    const cli = new Clirio();
    cli.setModules([MigrationModule]);
    cli.setGlobalFilter({
      catch: catchSpy,
    });

    await cli
      .execute(
        Clirio.split(
          'migration up type-dbo 15135 -e DB_NAME=db-name -e DB_TABLE=db-table --id=149542 -s --start-date=1 --end-date --algorithm=a',
        ),
      )
      .catch(() => null);

    const [err] = catchSpy.getCall(0).args;

    expect(err instanceof ClirioValidationError).toBeTruthy();
    expect(err).toMatchObject({
      propertyName: 'typeId',
      dataType: 'params',
    });
  });
});
