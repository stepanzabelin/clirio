import { Description, Option } from '@clirio';

export class HelloOptionsDto {
  @Option('--first-name, -f, --fname')
  @Description('First name')
  readonly firstName?: string;

  @Option('--last-name, -l')
  @Description('Last name')
  readonly lastName?: string;

  @Option('--verbose, -v')
  @Description('Verbose')
  readonly verbose?: boolean;
}
