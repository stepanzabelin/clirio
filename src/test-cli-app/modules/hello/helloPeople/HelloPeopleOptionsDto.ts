import { Option } from '@clirio';

export class HelloPeopleOptionsDto {
  @Option('--name, -n', {
    cast: 'array',
  })
  readonly names!: string[];
}
