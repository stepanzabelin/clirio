import { Option } from '../../../../../decorators';

export class GitAddOptionsDto {
  @Option('--verbose, -v')
  readonly verbose?: boolean;

  @Option('--chmod')
  readonly chmod?: '+x' | '-x';
}
