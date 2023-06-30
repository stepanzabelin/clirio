import { ClirioPipe } from './ClirioPipe';
import { Constructor } from './Constructor';

export type Pipe = Constructor<ClirioPipe> | ClirioPipe;
