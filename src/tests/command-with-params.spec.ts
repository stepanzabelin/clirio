import sinon from 'sinon';
import { Clirio, ClirioError } from '@clirio';
import { HelloModule } from '../test-cli-app/modules/hello';
import { HelloToService } from '../test-cli-app/modules/hello/hello-to';

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

  it('Test 1.1. Positive', async () => {
    const entrySpy = sandbox.stub(HelloToService.prototype, 'entry');

    await buildCli().execute(Clirio.split('hello to Alex Smith'));

    const [params] = entrySpy.getCall(0).args;

    expect(params).toStrictEqual({
      firstName: 'Alex',
      'last-name': 'Smith',
    });

    entrySpy.restore();
  });

  it('Test 1.2. Negative', async () => {
    const catchSpy = sandbox.spy();

    await buildCli()
      .setGlobalException({
        catch: catchSpy,
      })
      .execute(Clirio.split('hello to Alex'))
      .catch(() => null);

    const [err] = catchSpy.getCall(0).args;

    expect(
      err instanceof ClirioError && err.errCode === 'INCORRECT_COMMAND',
    ).toBeTruthy();
  });

  it('Test 1.3 Negative', async () => {
    const catchSpy = sandbox.spy();

    await buildCli()
      .setGlobalException({
        catch: catchSpy,
      })
      .execute(Clirio.split('hello to Alex Smith Junior'))
      .catch(() => null);

    const [err] = catchSpy.getCall(0).args;

    expect(
      err instanceof ClirioError && err.errCode === 'INCORRECT_COMMAND',
    ).toBeTruthy();
  });

  // it('invalid input extra param', async () => {
  //   const entryStub = sandbox.stub(CommonFailureService.prototype, 'entry');

  //   await buildCli().execute(Clirio.split('hello Alex'));

  //   expect(entryStub.calledOnce).toBeTruthy();
  // });
});
