import { Option } from '../../../../../index';

export class HelloPeopleOptionsDto {
  @Option('--name, -n', {
    isArray: true,
  })
  readonly names!: string[];
}
