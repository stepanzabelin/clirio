import { ClirioException } from './ClirioException';
import { Constructor } from './Constructor';

export type Exception = Constructor<ClirioException> | ClirioException;
