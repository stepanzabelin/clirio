import sinon from 'sinon';
import {
  Clirio,
  Command,
  Module,
  Option,
  Options,
  Param,
  Params,
} from '@clirio';
import { MigrationModule } from '../test-cli-app/modules/migration';

class ToxicOptionsDto {
  @Option('--hasOwnProperty')
  readonly safeValue!: string;
}

class ToxicParamsDto {
  @Param('hasOwnProperty')
  readonly safeValue!: string;
}

@Module()
class SecurityModule {
  @Command('option-audit')
  public optionAudit(@Options() options: ToxicOptionsDto) {
    console.log(options);
  }

  @Command('param-audit <hasOwnProperty>')
  public paramAudit(@Params() params: ToxicParamsDto) {
    console.log(params);
  }
}

const buildCli = () => {
  const cli = new Clirio();
  cli.setModules([SecurityModule, MigrationModule]);
  return cli;
};

describe('Security cases', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('1.1 option aliases accept reserved property names', async () => {
    const entryStub = sandbox.stub(SecurityModule.prototype, 'optionAudit');

    await buildCli().execute(Clirio.split('option-audit --hasOwnProperty yes'));

    const [options] = entryStub.getCall(0).args;

    expect(options).toStrictEqual({
      safeValue: 'yes',
    });
  });

  it('1.2 param aliases accept reserved property names', async () => {
    const entryStub = sandbox.stub(SecurityModule.prototype, 'paramAudit');

    await buildCli().execute(Clirio.split('param-audit yes'));

    const [params] = entryStub.getCall(0).args;

    expect(params).toStrictEqual({
      safeValue: 'yes',
    });
  });

  it('1.3 key-value transforms do not pollute object prototypes', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'run');

    await buildCli().execute(
      Clirio.split(
        'migration run -e __proto__=polluted -e constructor=ctor --silent',
      ),
    );

    const [options] = entryStub.getCall(0).args;
    const envs = options.envs!;

    expect(Object.getPrototypeOf(envs)).toBe(Object.prototype);
    expect(Object.prototype.hasOwnProperty.call(envs, '__proto__')).toBe(true);
    expect(envs['__proto__']).toBe('polluted');
    expect(Object.prototype.hasOwnProperty.call(envs, 'constructor')).toBe(
      true,
    );
    expect(envs.constructor).toBe('ctor');
    expect(({} as Record<string, string>).polluted).toBeUndefined();
  });
});
