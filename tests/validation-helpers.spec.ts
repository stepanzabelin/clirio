import sinon from 'sinon';
import {
  Clirio,
  ClirioValidationError,
  Command,
  Module,
  Option,
  Options,
  Validate,
} from '@clirio';

class RequiredOptionsDto {
  @Option('--name')
  @Validate([Clirio.valid.REQUIRED, Clirio.valid.STRING])
  readonly name!: string;
}

@Module()
class ValidationHelpersModule {
  @Command('required')
  public required(@Options() options: RequiredOptionsDto) {
    console.log(options);
  }
}

const buildCli = () => {
  const cli = new Clirio();
  cli.setModules([ValidationHelpersModule]);
  return cli;
};

describe('Validation helpers', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('1.1', async () => {
    const entryStub = sandbox.stub(
      ValidationHelpersModule.prototype,
      'required',
    );

    await buildCli().execute(Clirio.split('required --name Alex'));

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      name: 'Alex',
    });
  });

  it('1.2', async () => {
    const err = await buildCli()
      .execute(Clirio.split('required'))
      .catch((err) => err);

    expect(err instanceof ClirioValidationError).toBeTruthy();
    expect(err).toMatchObject({
      propertyName: 'name',
      dataType: 'options',
    });
  });

  it('1.3', () => {
    expect(Clirio.valid.REQUIRED(undefined)).toBe(false);
    expect(Clirio.valid.REQUIRED(null)).toBe(false);
    expect(Clirio.valid.REQUIRED('Alex')).toBeNull();
    expect(Clirio.valid.OPTIONAL(undefined)).toBe(true);
    expect(Clirio.valid.OPTIONAL('Alex')).toBeNull();
    expect(Clirio.valid.NULLABLE(null)).toBe(true);
    expect(Clirio.valid.NULLABLE('Alex')).toBeNull();
  });
});
