import sinon from 'sinon';
import { Clirio, ClirioError } from '@clirio';
import { HelloModule } from '../test-cli-app/modules/hello';

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
    const entrySpy = sandbox.stub(HelloModule.prototype, 'helloThere');

    await buildCli().execute(Clirio.split('hello there'));

    expect(entrySpy.calledOnce).toBeTruthy();
  });

  it('Test 2.1. Positive', async () => {
    const entrySpy = sandbox.stub(HelloModule.prototype, 'helloPlanet');

    await buildCli().execute(Clirio.split('hello venus'));

    expect(entrySpy.calledOnce).toBeTruthy();
  });

  it('Test 2.2. Positive', async () => {
    const entrySpy = sandbox.stub(HelloModule.prototype, 'helloPlanet');

    await buildCli().execute(Clirio.split('hello earth'));

    expect(entrySpy.calledOnce).toBeTruthy();
  });

  it('Test 2.3. Positive', async () => {
    const entrySpy = sandbox.stub(HelloModule.prototype, 'helloPlanet');

    await buildCli().execute(Clirio.split('hello mars'));

    expect(entrySpy.calledOnce).toBeTruthy();
  });

  it('Test 2.4. Negative', async () => {
    const catchSpy = sandbox.spy();

    await buildCli()
      .setGlobalException({
        catch: catchSpy,
      })
      .execute(Clirio.split('hello jupiter'))
      .catch(() => null);

    const [err] = catchSpy.getCall(0).args;

    expect(
      err instanceof ClirioError && err.errCode === 'INCORRECT_COMMAND',
    ).toBeTruthy();
  });

  it('Test 3.1. Positive', async () => {
    const entrySpy = sandbox.stub(HelloModule.prototype, 'helloTo');

    await buildCli().execute(Clirio.split('hello to Alex Smith'));

    const [params] = entrySpy.getCall(0).args;

    expect(params).toStrictEqual({
      firstName: 'Alex',
      'last-name': 'Smith',
    });
  });

  it('Test 3.2. Negative', async () => {
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

  it('Test 3.3. Negative', async () => {
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

  it('Test 3.4. Negative', async () => {
    const catchSpy = sandbox.spy();

    await buildCli()
      .setGlobalException({
        catch: catchSpy,
      })
      .execute(Clirio.split('hello to'))
      .catch(() => null);

    const [err] = catchSpy.getCall(0).args;

    expect(
      err instanceof ClirioError && err.errCode === 'INCORRECT_COMMAND',
    ).toBeTruthy();
  });

  it('Test 3.5. Positive', async () => {
    const entrySpy = sandbox.stub(HelloModule.prototype, 'helloToUnknown');

    await buildCli().execute(Clirio.split('hello to-unknown Alex Smith'));

    const [params] = entrySpy.getCall(0).args;

    expect(params).toStrictEqual({
      'first-name': 'Alex',
      'last-name': 'Smith',
    });
  });

  it('Test 4.1. Positive', async () => {
    const entrySpy = sandbox.stub(HelloModule.prototype, 'helloGuys');

    await buildCli().execute(Clirio.split('hello guys Alex Jack Max'));

    const [params] = entrySpy.getCall(0).args;

    expect(params).toStrictEqual({ names: ['Alex', 'Jack', 'Max'] });
  });

  it('Test 4.2. Positive', async () => {
    const entrySpy = sandbox.stub(HelloModule.prototype, 'helloGuys');

    await buildCli().execute(
      Clirio.split('hello guys "Alex Smith" Jack "Max Martinez"'),
    );

    const [params] = entrySpy.getCall(0).args;

    expect(params).toStrictEqual({
      names: ['Alex Smith', 'Jack', 'Max Martinez'],
    });
  });

  it('Test 4.3. Positive', async () => {
    const entrySpy = sandbox.stub(HelloModule.prototype, 'helloUnknownGuys');

    await buildCli().execute(
      Clirio.split('hello unknown-guys "Alex Smith" Jack "Max Martinez"'),
    );

    const [params] = entrySpy.getCall(0).args;

    expect(params).toStrictEqual({
      'all-names': ['Alex Smith', 'Jack', 'Max Martinez'],
    });
  });

  it('Test 5.1. Positive', async () => {
    const entrySpy = sandbox.stub(HelloModule.prototype, 'universalHello');

    await buildCli().execute(
      Clirio.split(
        'hello people from Earth to "Alex Smith" Jack "Max Martinez"',
      ),
    );

    const [params] = entrySpy.getCall(0).args;

    expect(params).toStrictEqual({
      planet: 'Earth',
      creatureNames: ['Alex Smith', 'Jack', 'Max Martinez'],
    });
  });

  it('Test 5.2. Positive', async () => {
    const entrySpy = sandbox.stub(
      HelloModule.prototype,
      'helloPlanetCreatures',
    );

    await buildCli().execute(
      Clirio.split(
        'hello planet-creatures Earth "Alex Smith" Jack "Max Martinez"',
      ),
    );

    const [params] = entrySpy.getCall(0).args;

    expect(params).toStrictEqual({
      planet: 'Earth',
      creatureNames: ['Alex Smith', 'Jack', 'Max Martinez'],
    });
  });
});
