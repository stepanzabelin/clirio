import { Option } from '../../../../../decorators';

export class GitStatusOptionsDto {
  @Option('--branch, -b')
  readonly branch?: string;

  @Option('--short, -s')
  readonly short?: boolean;

  @Option('--ignore-submodules')
  readonly ignoreSubmodules?: 'none' | 'untracked' | 'dirty' | 'all';
}
