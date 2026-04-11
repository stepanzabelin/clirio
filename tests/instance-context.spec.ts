import {
  Clirio,
  ClirioCommonError,
  ClirioFilter,
  ClirioPipe,
  Command,
  FilterContext,
  Module,
  Option,
  Options,
  Param,
  Params,
  PipeContext,
} from '@clirio';

class EchoParamsDto {
  @Param('value')
  readonly value!: string;
}

class FlagOptionsDto {
  @Option('--flag')
  readonly flag?: string;
}

@Module()
class StatefulModule {
  public calls = 0;
  public seen: Array<{ value: string; flag?: string }> = [];

  @Command('echo <value>')
  public echo(
    @Params() params: EchoParamsDto,
    @Options() options: FlagOptionsDto,
  ) {
    this.calls += 1;
    this.seen.push({
      value: params.value,
      flag: options.flag,
    });
  }
}

class StatefulPipe implements ClirioPipe {
  public calls = 0;
  public readonly prefix = 'global-pipe';

  transform(data: any, context: PipeContext): any {
    this.calls += 1;

    if (context.dataType === 'params') {
      return {
        ...data,
        value: `${this.prefix}:${data.value}`,
      };
    }

    if (context.dataType === 'options' && data.flag) {
      return {
        ...data,
        flag: `${this.prefix}:${data.flag}`,
      };
    }

    return data;
  }
}

class StatefulFilter implements ClirioFilter {
  public calls = 0;
  public readonly prefix = 'global-filter';

  catch(error: Error, _context: FilterContext): never {
    this.calls += 1;
    throw new ClirioCommonError(`${this.prefix}:${error.message}`, {
      code: 'FILTERED',
    });
  }
}

@Module()
class BrokenModule {
  @Command('explode')
  public explode() {
    throw new Error('boom');
  }
}

describe('Instance context', () => {
  it('1.1 keeps module instance context for resolved modules', async () => {
    const moduleInstance = new StatefulModule();
    const cli = new Clirio();

    cli.setModules([moduleInstance]);

    await cli.execute(Clirio.split('echo hello --flag world'));

    expect(moduleInstance.calls).toBe(1);
    expect(moduleInstance.seen).toStrictEqual([
      {
        value: 'hello',
        flag: 'world',
      },
    ]);
  });

  it('1.2 keeps pipe instance context for global pipe instances', async () => {
    const moduleInstance = new StatefulModule();
    const pipeInstance = new StatefulPipe();
    const cli = new Clirio();

    cli.setModules([moduleInstance]);
    cli.setGlobalPipe(pipeInstance);

    await cli.execute(Clirio.split('echo hello --flag world'));

    expect(pipeInstance.calls).toBe(2);
    expect(moduleInstance.seen).toStrictEqual([
      {
        value: 'global-pipe:hello',
        flag: 'global-pipe:world',
      },
    ]);
  });

  it('1.3 keeps filter instance context for global filter instances', async () => {
    const filterInstance = new StatefulFilter();
    const cli = new Clirio();

    cli.setModules([new BrokenModule()]);
    cli.setGlobalFilter(filterInstance);

    const err = await cli
      .execute(Clirio.split('explode'))
      .catch((error) => error);

    expect(filterInstance.calls).toBe(1);
    expect(err).toBeInstanceOf(ClirioCommonError);
    expect(err).toMatchObject({
      code: 'FILTERED',
      message: 'global-filter:boom',
    });
  });
});
