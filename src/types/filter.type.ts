import { ClirioFilter } from './clirio-filter.type';
import { Constructor } from './constructor.type';

export type Filter = Constructor<ClirioFilter> | ClirioFilter;
