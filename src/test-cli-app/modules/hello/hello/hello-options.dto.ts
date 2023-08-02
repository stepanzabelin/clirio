import { Option } from '@clirio';

export class HelloOptionsDto {
  @Option('--first-name, -f, --fname', { description: 'First name' })
  readonly firstName?: string;

  @Option('--last-name, -l', { description: 'Last name' })
  readonly lastName?: string;

  @Option('--verbose, -v', { description: 'Verbose' })
  readonly verbose?: boolean;
}
