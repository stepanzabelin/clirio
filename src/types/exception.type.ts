import { ClirioException } from './clirio-exception.type';
import { Constructor } from './constructor.type';

export type Exception = Constructor<ClirioException> | ClirioException;
