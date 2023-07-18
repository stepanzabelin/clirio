import { Clirio, Option, Transform } from '@clirio';

export class HelloPeopleOptionsDto {
  @Option('--name, -n')
  @Transform(Clirio.form('ARRAY'))
  readonly names!: string[];
}
