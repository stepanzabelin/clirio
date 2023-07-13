import sinon from 'sinon';
import { cliApp } from '../test-env/cli-app/cliApp';
import { HelloService } from '../test-env/cli-app/modules/hello/hello';
import { emulateArgv } from '../test-env/utils/emulateArgv';

describe('Command with options without layers', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('correct input', async () => {
    const entryStub = sandbox.stub(HelloService.prototype, 'entry');

    emulateArgv(sandbox, 'hello --first-name=Alex --last-name=Smith');
    await cliApp();

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      firstName: 'Alex',
      lastName: 'Smith',
    });

    entryStub.restore();
  });

  it('correct input with unknown parameters', async () => {
    const entryStub = sandbox.stub(HelloService.prototype, 'entry');

    emulateArgv(
      sandbox,
      'hello --first-name=Alex --last-name=Smith --middle-name=123',
    );
    await cliApp();

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      firstName: 'Alex',
      lastName: 'Smith',
      'middle-name': '123',
    });

    entryStub.restore();
  });

  // it('invalid input with unknown option', async () => {
  //   const errorCallbackStub = sinon.stub();

  //   emulateArgv(
  //     sandbox,
  //     'hello --first-name=Alex --last-name=Smith --middle-name=123'
  //   );

  //   await cliApp(errorCallbackStub);

  //   const err = errorCallbackStub.getCall(0).args[0];
  //   console.log({ err });

  //   expect(err.message).toEqual('"middle-name" is not allowed');
  // });

  // it('incorrect input', async () => {
  //   const errorCallbackStub = sinon.stub();

  //   emulateArgv(sandbox, 'hello --first-name');
  //   await cliApp();

  //   await cliApp(errorCallbackStub);

  //   const err = errorCallbackStub.getCall(0).args[0];

  //   expect(err.message).toEqual('"--first-name, -f" must be a string');
  // });
});
