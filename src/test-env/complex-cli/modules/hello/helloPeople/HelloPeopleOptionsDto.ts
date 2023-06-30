import { Option } from '../../../../../decorators';

export class HelloPeopleOptionsDto {
  @Option('--name, -n', {
    isArray: true,
  })
  readonly names!: string[];
}
