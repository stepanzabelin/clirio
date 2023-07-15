import { Clirio } from '@clirio';
import sinon from 'sinon';
import { MigrationModule } from '../test-cli-app/modules/migration';
import { CommonModule } from '../test-cli-app/modules/common/common.module';
// import { CommonEmptyService } from '../test-cli-app/modules/common/empty';
// import { CommonFailureService } from '../test-cli-app/modules/common/failure';
import { HelloModule } from '../test-cli-app/modules/hello';
import { MigrationEmptyService } from '../test-cli-app/modules/migration/empty';
import { GitModule } from '../test-cli-app/modules/git';

const buildCli = () => {
  const cli = new Clirio();
  cli.setModules([MigrationModule, HelloModule, CommonModule, GitModule]);
  return cli;
};

describe('Empty command', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  // it('Empty without handler', async () => {
  //   const globalExceptionCatch = sinon.stub();

  //   emulateArgv(sandbox, '');

  //   await cliApp({ globalExceptionCatch });

  //   const err = globalExceptionCatch.getCall(0).args[0];

  //   expect(err.message).toEqual('Incorrect command specified');
  // });

  // NEGATIVE
  // it('Empty with handler in the root', async () => {
  //   const entryStub = sandbox.stub(CommonEmptyService.prototype, 'entry');

  //   await buildCli().execute(
  //     Clirio.split(
  //       'hello --first-name=Alex -f John --first-name Max -l Smith --verbose -v',
  //     ),
  //   );

  //   expect(entryStub.calledOnce).toBeTruthy();
  // });

  it('Empty with handler in nested module', async () => {
    const entryStub = sandbox.stub(MigrationEmptyService.prototype, 'entry');

    await buildCli()
      .execute(Clirio.split('migration'))
      .catch((err) => null);

    expect(entryStub.calledOnce).toBeTruthy();
  });
});
