import sinon from 'sinon';
import { Clirio } from '@clirio';
import { HelloModule } from '../test-cli-app/modules/hello';

const buildCli = () => {
  const cli = new Clirio();
  cli.setModules([HelloModule]);
  return cli;
};

describe('Command with options without handlers', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('Test 1.1. Positive', async () => {
    const entryStub = sandbox.stub(HelloModule.prototype, 'hello');

    await buildCli().execute(
      Clirio.split('hello --first-name=Alex --last-name=Smith'),
    );

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      firstName: 'Alex',
      lastName: 'Smith',
    });
  });

  it('Test 1.2. Positive', async () => {
    const entryStub = sandbox.stub(HelloModule.prototype, 'hello');

    await buildCli().execute(
      Clirio.split('hello --first-name Alex --last-name Smith'),
    );

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      firstName: 'Alex',
      lastName: 'Smith',
    });
  });

  it('Test 1.3. Positive', async () => {
    const entryStub = sandbox.stub(HelloModule.prototype, 'hello');

    await buildCli().execute(Clirio.split('hello -f Alex -l Smith'));

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      firstName: 'Alex',
      lastName: 'Smith',
    });
  });

  it('Test 1.4. Positive', async () => {
    const entryStub = sandbox.stub(HelloModule.prototype, 'hello');

    await buildCli().execute(Clirio.split('hello --first-name Alex -l Smith'));

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      firstName: 'Alex',
      lastName: 'Smith',
    });
  });

  it('Test 2.1. Positive', async () => {
    const entryStub = sandbox.stub(HelloModule.prototype, 'hello');

    await buildCli().execute(
      Clirio.split(
        'hello --first-name=Alex --last-name=Smith --middle-name=123 -u 4 -z --yes',
      ),
    );

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      firstName: 'Alex',
      lastName: 'Smith',
      'middle-name': '123',
      u: '4',
      z: null,
      yes: null,
    });
  });

  it('Test 2.2. Positive', async () => {
    const entryStub = sandbox.stub(HelloModule.prototype, 'hello');

    await buildCli().execute(
      Clirio.split(
        'hello --first-name=Alex -l Smith --middle-name=123 -u 4 -z --yes',
      ),
    );

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      firstName: 'Alex',
      lastName: 'Smith',
      'middle-name': '123',
      u: '4',
      z: null,
      yes: null,
    });
  });

  it('Test 2.3. Positive', async () => {
    const entryStub = sandbox.stub(HelloModule.prototype, 'hello');

    await buildCli().execute(
      Clirio.split(
        'hello --first-name=Alex -l Smith --middle-name=123 -u 4 -z --yes',
      ),
    );

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      firstName: 'Alex',
      lastName: 'Smith',
      'middle-name': '123',
      u: '4',
      z: null,
      yes: null,
    });
  });

  it('Test 3.1. Positive', async () => {
    const entryStub = sandbox.stub(HelloModule.prototype, 'hello');

    await buildCli().execute(
      Clirio.split("hello --first-name=John --last-name=John's --verbose"),
    );

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      firstName: 'John',
      lastName: "John's",
      verbose: null,
    });
  });

  it('Test 3.2. Positive', async () => {
    const entryStub = sandbox.stub(HelloModule.prototype, 'hello');

    await buildCli().execute(Clirio.split("hello -f John -l John's -v"));

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      firstName: 'John',
      lastName: "John's",
      verbose: null,
    });
  });

  it('Test 3.3. Positive', async () => {
    const entryStub = sandbox.stub(HelloModule.prototype, 'hello');

    await buildCli().execute(
      Clirio.split("hello -f John --last-name=John's -v"),
    );

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      firstName: 'John',
      lastName: "John's",
      verbose: null,
    });
  });

  it('Test 4.1. Positive', async () => {
    const entryStub = sandbox.stub(HelloModule.prototype, 'hello');

    await buildCli().execute(
      Clirio.split(
        'hello --first-name=Alex --first-name=John --first-name=Max --last-name=Smith --verbose --verbose',
      ),
    );

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      firstName: ['Alex', 'John', 'Max'],
      lastName: 'Smith',
      verbose: [null, null],
    });
  });

  it('Test 4.2. Positive', async () => {
    const entryStub = sandbox.stub(HelloModule.prototype, 'hello');

    await buildCli().execute(
      Clirio.split('hello -f Alex -f John -f Max -l Smith -v -v'),
    );

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      firstName: ['Alex', 'John', 'Max'],
      lastName: 'Smith',
      verbose: [null, null],
    });
  });

  it('Test 4.3. Positive', async () => {
    const entryStub = sandbox.stub(HelloModule.prototype, 'hello');

    await buildCli().execute(
      Clirio.split(
        'hello --first-name=Alex -f John --first-name Max -l Smith --verbose -v',
      ),
    );

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      firstName: ['Alex', 'Max', 'John'],
      lastName: 'Smith',
      verbose: [null, null],
    });
  });

  // it('Test #3. Negative', async () => {
  //   const errorCallbackStub = sinon.stub();

  //   await buildCli().execute(
  //     Clirio.split(
  //       'hello --first-name=Alex --last-name=Smith --middle-name=123',
  //     ),
  //   );

  //   await cliApp(errorCallbackStub);

  //   const err = errorCallbackStub.getCall(0).args[0];
  //   console.log({ err });

  //   expect(err.message).toEqual('"middle-name" is not allowed');
  // });

  // it('incorrect input', async () => {
  //   const errorCallbackStub = sinon.stub();

  //   emulateArgv(sandbox, 'hello --first-name');
  //

  //   await cliApp(errorCallbackStub);

  //   const err = errorCallbackStub.getCall(0).args[0];

  //   expect(err.message).toEqual('"--first-name, -f" must be a string');
  // });
});
