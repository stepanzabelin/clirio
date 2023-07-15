import sinon from 'sinon';
import { Clirio } from '@clirio';
import { HelloModule } from '../test-cli-app/modules/hello';
import { GitModule } from '../test-cli-app/modules/git';
import { MigrationModule } from '../test-cli-app/modules/migration';
import { PingModule } from '../test-cli-app/modules/ping';
import { CommonModule } from '../test-cli-app/modules/common/common.module';

const buildCli = () => {
  const cli = new Clirio();
  cli.setModules([
    HelloModule,
    GitModule,
    new MigrationModule(),
    PingModule,
    CommonModule,
  ]);
  return cli;
};

describe('Exact command', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('Test 1.1. Positive', async () => {
    const entrySpy = sandbox.stub(HelloModule.prototype, 'helloThere');

    await buildCli().execute(Clirio.split('hello there'));

    expect(entrySpy.calledOnce).toBeTruthy();
  });

  // it('correct input compound command', async () => {
  //   const entryStub = sandbox.stub(HelloThereService.prototype, 'entry');

  //   await buildCli().execute(Clirio.split('hello there'));

  //   expect(entryStub.calledOnce).toBeTruthy();

  //   entryStub.restore();
  // });

  // it('correct input simple command with extra option without options dto', async () => {
  //   const entryStub = sandbox.stub(HelloThereService.prototype, 'entry');

  //   emulateArgv(sandbox, 'hello there --name=Alex');
  //

  //   expect(entryStub.calledOnce).toBeTruthy();
  // });

  // it('invalid input simple command with extra param', async () => {
  //   const entryStub = sandbox.stub(CommonFailureService.prototype, 'entry');

  //   await buildCli().execute(Clirio.split('hello Alex'));

  //   expect(entryStub.calledOnce).toBeTruthy();
  // });

  // it('invalid input compound command with extra param', async () => {
  //   const globalExceptionCatch = sinon.stub();

  //   emulateArgv(sandbox, 'ping ping');

  //   await cliApp({ globalExceptionCatch });

  //   const err = globalExceptionCatch.getCall(0).args[0];

  //   expect(err.message).toEqual('Incorrect command specified');
  // });
});
