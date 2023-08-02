import { ClirioPipe } from './clirio-pipe.type';
import { Constructor } from './constructor.type';

export type Pipe = Constructor<ClirioPipe> | ClirioPipe;
