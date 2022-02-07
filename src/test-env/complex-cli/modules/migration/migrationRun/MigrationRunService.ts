import { MigrationRunOptionsDto } from './MigrationRunOptionsDto';

export class MigrationRunService {
  public entry(options: MigrationRunOptionsDto) {
    console.log('Migration Run!', options);
  }
}
