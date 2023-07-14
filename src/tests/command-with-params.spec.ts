import sinon from 'sinon';
import { Clirio } from '../index';
import { cliApp } from '../test-cli-app/cliApp';
import { HelloModule } from '../test-cli-app/modules/hello';
import { CommonFailureService } from '../test-cli-app/modules/common/failure';
import { HelloToService } from '../test-cli-app/modules/hello/helloTo';

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

    await cliApp();

    const [params] = entrySpy.getCall(0).args;

    expect(params).toStrictEqual({
      firstName: 'Alex',
      'last-name': 'Smith',
    });

    entrySpy.restore();
  });

  it('Test 1.2. Positive', async () => {
    const entrySpy = sandbox.stub(HelloToService.prototype, 'entry');

    await buildCli().execute(
      Clirio.split('hello to Alex Smith --no-middle-name'),
    );

    const [params] = entrySpy.getCall(0).args;

    expect(params).toStrictEqual({
      firstName: 'Alex',
      'last-name': 'Smith',
    });

    entrySpy.restore();
  });

  // it('invalid input extra param', async () => {
  //   const entryStub = sandbox.stub(CommonFailureService.prototype, 'entry');

  //   await buildCli().execute(Clirio.split('hello Alex'));

  //   expect(entryStub.calledOnce).toBeTruthy();
  // });
});
