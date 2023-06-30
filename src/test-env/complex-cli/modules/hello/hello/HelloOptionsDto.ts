import { Description, Option } from '../../../../../decorators';

export class HelloOptionsDto {
  @Option('--first-name, -f')
  @Description('First name')
  readonly firstName?: string;

  @Option('--last-name, -l')
  @Description('Last name')
  readonly lastName?: string;

  @Option('--verbose')
  @Description('Verbose')
  readonly verbose?: boolean;
}
