import { MigrationToOptionsDto } from './MigrationToOptionsDto';
import { MigrationToParamsDto } from './MigrationToParamsDto';

export class MigrationToService {
  public entry(params: MigrationToParamsDto, options: MigrationToOptionsDto) {
    console.log('!!!!!!!Migration Run!??????', { params, options });
  }
}
