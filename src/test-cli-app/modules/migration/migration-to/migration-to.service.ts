import { MigrationToOptionsDto } from './migration-to-options.dto';
import { MigrationToParamsDto } from './migration-to-params.dto';

export class MigrationToService {
  public entry(params: MigrationToParamsDto, options: MigrationToOptionsDto) {
    console.log('Migration to', { params, options });
  }
}
