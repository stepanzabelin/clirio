import { MigrationRunOptionsDto } from './migration-run-options.dto';

export class MigrationRunService {
  public entry(options: MigrationRunOptionsDto) {
    console.log('Migration Run!', options);
  }
}
