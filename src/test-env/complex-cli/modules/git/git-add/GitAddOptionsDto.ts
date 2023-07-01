import { Option } from '../../../../../index';

export class GitAddOptionsDto {
  @Option('--verbose, -v')
  readonly verbose?: boolean;

  @Option('--chmod')
  readonly chmod?: '+x' | '-x';
}
