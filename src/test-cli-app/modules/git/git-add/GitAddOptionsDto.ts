import { Option, Validate } from '../../../../../index';

export class GitAddOptionsDto {
  @Option('--verbose, -v')
  @Validate((v) => !v || ['true', 'false', 'null'].includes(v))
  readonly verbose?: boolean;

  @Option('--chmod')
  @Validate((v) => !v || ['+x', '-x'].includes(v))
  readonly chmod?: '+x' | '-x';
}
