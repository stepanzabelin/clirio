import sinon from 'sinon';
import { Clirio, ClirioValidationError } from '@clirio';
import { CommonModule } from '../test-cli-app/modules/common';
import { WeatherModule } from '../test-cli-app/modules/weather';

const buildCli = () => {
  const cli = new Clirio();
  cli.setModules([CommonModule, WeatherModule]);
  return cli;
};

describe('Command with envs', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('1.1', async () => {
    const entryStub = sandbox.stub(WeatherModule.prototype, 'auth');
    const envStub = sinon.stub(process, 'env').value({
      WEATHER_API_KEY: 'h1g5e5a9',
      WEATHER_API_VERSION: 2,
      WEATHER_EXTENDED: 'false',
      SECURE: 'true',
    });

    await buildCli().execute(Clirio.split('weather auth'));

    const [envs] = entryStub.getCall(0).args;

    expect(envs).toStrictEqual({
      key: 'h1g5e5a9',
      version: 2,
      WEATHER_EXTENDED: 'false',
      SECURE: 'true',
    });

    envStub.restore();
  });
});

it('2.1', async () => {
  const err = await buildCli()
    .execute(Clirio.split('weather auth'))
    .catch((err) => err);

  expect(err instanceof ClirioValidationError).toBeTruthy();

  expect(err).toMatchObject({
    dataType: 'envs',
    propertyName: 'key',
  });
});

it('2.2', async () => {
  const envStub = sinon.stub(process, 'env').value({
    WEATHER_API_KEY: 'h1g5e5a9',
    WEATHER_API_VERSION: 2,
  });

  const err = await buildCli()
    .execute(Clirio.split('weather auth'))
    .catch((err) => err);

  expect(err instanceof ClirioValidationError).toBeTruthy();

  expect(err).toMatchObject({
    dataType: 'envs',
    propertyName: 'WEATHER_EXTENDED',
  });

  envStub.restore();
});
