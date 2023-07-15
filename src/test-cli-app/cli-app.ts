import { Clirio } from '@clirio';
import { HelloModule } from './modules/hello/hello.module';

export const cliApp = async () => {
  const cli = new Clirio();
  cli.setModules([
    HelloModule,
    // CommonModule,
    // GitModule,
    // new MigrationModule(),
    // PingModule,
  ]);
  await cli.execute();
  return cli;
};
