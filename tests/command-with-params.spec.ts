import sinon from 'sinon';
import { Clirio, ClirioCommonError } from '@clirio';
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

  it('1.1', async () => {
    const entrySpy = sandbox.stub(HelloModule.prototype, 'helloThere');

    await buildCli().execute(Clirio.split('hello there'));

    expect(entrySpy.calledOnce).toBeTruthy();
  });

  it('2.1', async () => {
    const entrySpy = sandbox.stub(HelloModule.prototype, 'helloPlanet');

    await buildCli().execute(Clirio.split('hello venus'));

    expect(entrySpy.calledOnce).toBeTruthy();
  });

  it('2.2', async () => {
    const entrySpy = sandbox.stub(HelloModule.prototype, 'helloPlanet');

    await buildCli().execute(Clirio.split('hello earth'));

    expect(entrySpy.calledOnce).toBeTruthy();
  });

  it('2.3', async () => {
    const entrySpy = sandbox.stub(HelloModule.prototype, 'helloPlanet');

    await buildCli().execute(Clirio.split('hello mars'));

    expect(entrySpy.calledOnce).toBeTruthy();
  });

  it('2.4', async () => {
    const err = await buildCli()
      .execute(Clirio.split('hello jupiter'))
      .catch((err) => err);

    expect(
      err instanceof ClirioCommonError && err.code === 'INCORRECT_COMMAND',
    ).toBeTruthy();
  });

  it('3.1', async () => {
    const entrySpy = sandbox.stub(HelloModule.prototype, 'helloTo');

    await buildCli().execute(Clirio.split('hello to Alex Smith'));

    const [params] = entrySpy.getCall(0).args;

    expect(params).toStrictEqual({
      firstName: 'Alex',
      'last-name': 'Smith',
    });
  });

  it('3.2', async () => {
    const err = await buildCli()
      .execute(Clirio.split('hello to Alex'))
      .catch((err) => err);

    expect(
      err instanceof ClirioCommonError && err.code === 'INCORRECT_COMMAND',
    ).toBeTruthy();
  });

  it('3.3', async () => {
    const err = await buildCli()
      .execute(Clirio.split('hello to Alex Smith Junior'))
      .catch((err) => err);

    expect(
      err instanceof ClirioCommonError && err.code === 'INCORRECT_COMMAND',
    ).toBeTruthy();
  });

  it('3.4', async () => {
    const err = await buildCli()
      .execute(Clirio.split('hello to'))
      .catch((err) => err);

    expect(
      err instanceof ClirioCommonError && err.code === 'INCORRECT_COMMAND',
    ).toBeTruthy();
  });

  it('3.5', async () => {
    const entrySpy = sandbox.stub(HelloModule.prototype, 'helloToUnknown');

    await buildCli().execute(Clirio.split('hello to-unknown Alex Smith'));

    const [params] = entrySpy.getCall(0).args;

    expect(params).toStrictEqual({
      'first-name': 'Alex',
      'last-name': 'Smith',
    });
  });

  it('4.1', async () => {
    const entrySpy = sandbox.stub(HelloModule.prototype, 'helloGuys');

    await buildCli().execute(Clirio.split('hello guys Alex Jack Max'));

    const [params] = entrySpy.getCall(0).args;

    expect(params).toStrictEqual({ names: ['Alex', 'Jack', 'Max'] });
  });

  it('4.2', async () => {
    const entrySpy = sandbox.stub(HelloModule.prototype, 'helloGuys');

    await buildCli().execute(
      Clirio.split('hello guys "Alex Smith" Jack "Max Martinez"'),
    );

    const [params] = entrySpy.getCall(0).args;

    expect(params).toStrictEqual({
      names: ['Alex Smith', 'Jack', 'Max Martinez'],
    });
  });

  it('4.3', async () => {
    const entrySpy = sandbox.stub(HelloModule.prototype, 'helloUnknownGuys');

    await buildCli().execute(
      Clirio.split('hello unknown-guys "Alex Smith" Jack "Max Martinez"'),
    );

    const [params] = entrySpy.getCall(0).args;

    expect(params).toStrictEqual({
      'all-names': ['Alex Smith', 'Jack', 'Max Martinez'],
    });
  });

  it('5.1', async () => {
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

  it('5.2', async () => {
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
