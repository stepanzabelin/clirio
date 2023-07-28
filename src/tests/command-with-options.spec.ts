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

  it('1.1 / Positive', async () => {
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

  it('1.2 / Positive', async () => {
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

  it('1.3 / Positive', async () => {
    const entryStub = sandbox.stub(HelloModule.prototype, 'hello');

    await buildCli().execute(Clirio.split('hello -f Alex -l Smith'));

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      firstName: 'Alex',
      lastName: 'Smith',
    });
  });

  it('1.4 / Positive', async () => {
    const entryStub = sandbox.stub(HelloModule.prototype, 'hello');

    await buildCli().execute(Clirio.split('hello --first-name Alex -l Smith'));

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      firstName: 'Alex',
      lastName: 'Smith',
    });
  });

  it('1.5 / Positive', async () => {
    const entryStub = sandbox.stub(HelloModule.prototype, 'helloUnknown');

    await buildCli().execute(
      Clirio.split(
        'hello-unknown --first-name Alex -l Smith --last-name=Smith',
      ),
    );

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      'first-name': 'Alex',
      l: 'Smith',
      'last-name': 'Smith',
    });
  });

  it('2.1 / Positive', async () => {
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

  it('2.2 / Positive', async () => {
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

  it('2.3 / Positive', async () => {
    const entryStub = sandbox.stub(HelloModule.prototype, 'hello');

    await buildCli().execute(
      Clirio.split(
        'hello --fname=Alex -l Smith --middle-name=123 -u 4 -z --yes',
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

  it('3.1 / Positive', async () => {
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

  it('3.2 / Positive', async () => {
    const entryStub = sandbox.stub(HelloModule.prototype, 'hello');

    await buildCli().execute(Clirio.split("hello -f John -l John's -v"));

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      firstName: 'John',
      lastName: "John's",
      verbose: null,
    });
  });

  it('3.3 / Positive', async () => {
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

  it('4.1 / Positive', async () => {
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

  it('4.2 / Positive', async () => {
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

  it('4.3 / Positive', async () => {
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

  it('4.4 / Positive', async () => {
    const entryStub = sandbox.stub(HelloModule.prototype, 'hello');

    await buildCli().execute(
      Clirio.split(
        'hello --first-name= -f --first-name Max -l "" --verbose= -v',
      ),
    );

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      firstName: ['', 'Max', null],
      lastName: '',
      verbose: ['', null],
    });
  });
});
