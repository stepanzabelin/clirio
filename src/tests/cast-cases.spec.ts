import sinon from 'sinon';
import { Clirio } from '@clirio';
import { MigrationModule } from '../test-cli-app/modules/migration';

const buildCli = () => {
  const cli = new Clirio();
  cli.setModules([MigrationModule]);
  return cli;
};

describe('Cast cases for Params and Options', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('1.1', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'status');

    await buildCli().execute(
      Clirio.split(
        'migration status users --id=15 -d 22.12.22 -f A --format B --verbose --verbose',
      ),
    );

    const [params, options] = entryStub.getCall(0).args;

    expect(params).toStrictEqual({ tables: 'users' });

    expect(options).toStrictEqual({
      id: ['15'],
      d: '22.12.22',
      format: 'A',
      silent: [null, null],
    });
  });

  it('1.2', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'status');

    await buildCli().execute(
      Clirio.split(
        'migration status users -i 15 --from-date=22.12.22 --format A -f B --verbose --verbose',
      ),
    );

    const [params, options] = entryStub.getCall(0).args;

    expect(params).toStrictEqual({ tables: 'users' });

    expect(options).toStrictEqual({
      id: ['15'],
      d: '22.12.22',
      format: 'A',
      silent: [null, null],
    });
  });

  it('1.3', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'status');

    await buildCli().execute(
      Clirio.split(
        'migration status users roles permissions --id=15 --id=17 -d 22.12.22 -d 21.11.21 -f A --verbose',
      ),
    );

    const [params, options] = entryStub.getCall(0).args;

    expect(params).toStrictEqual({ tables: 'users' });

    expect(options).toStrictEqual({
      id: ['15', '17'],
      d: ['22.12.22', '21.11.21'],
      format: 'A',
      silent: null,
    });
  });

  it('2.1', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'statusUnknown');

    await buildCli().execute(
      Clirio.split(
        'migration status-unknown users --id=15 -d 22.12.22 -f A --format B --verbose --verbose',
      ),
    );

    const [params, options] = entryStub.getCall(0).args;

    expect(params).toStrictEqual({ 'db-tables': ['users'] });

    expect(options).toStrictEqual({
      id: '15',
      d: '22.12.22',
      f: 'A',
      format: 'B',
      verbose: [null, null],
    });
  });

  it('2.2', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'statusUnknown');

    await buildCli().execute(
      Clirio.split(
        'migration status-unknown users -i 15 --from-date=22.12.22 --format A -f B --verbose --verbose',
      ),
    );

    const [params, options] = entryStub.getCall(0).args;

    expect(params).toStrictEqual({ 'db-tables': ['users'] });

    expect(options).toStrictEqual({
      i: '15',
      'from-date': '22.12.22',
      format: 'A',
      f: 'B',
      verbose: [null, null],
    });
  });

  it('3.3', async () => {
    const entryStub = sandbox.stub(MigrationModule.prototype, 'statusUnknown');

    await buildCli().execute(
      Clirio.split(
        'migration status-unknown users roles permissions --id=15 --id=17 -d 22.12.22 -d 21.11.21 -f A --verbose',
      ),
    );

    const [params, options] = entryStub.getCall(0).args;

    expect(params).toStrictEqual({
      'db-tables': ['users', 'roles', 'permissions'],
    });

    expect(options).toStrictEqual({
      id: ['15', '17'],
      d: ['22.12.22', '21.11.21'],
      f: 'A',
      verbose: null,
    });
  });
});
