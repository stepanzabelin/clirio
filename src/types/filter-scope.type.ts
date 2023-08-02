import { Filter } from './filter.type';

export type FilterScope = {
  scope: 'global' | 'action';
  filter: Filter;
};
