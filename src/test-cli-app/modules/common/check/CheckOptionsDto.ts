import { Option } from '../../../../../index';

export class CheckOptionsDto {
  @Option('--verbose, -v')
  readonly verbose?: boolean;

  @Option('--pool, -p')
  readonly pool!: number;
}
