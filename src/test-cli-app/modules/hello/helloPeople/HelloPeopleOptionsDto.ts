import { Option } from '../../../../../index';

export class HelloPeopleOptionsDto {
  @Option('--name, -n', {
    cast: 'array',
  })
  readonly names!: string[];
}
