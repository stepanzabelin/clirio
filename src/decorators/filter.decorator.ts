import { filterTargetMetadata } from '../metadata';
import { Constructor, FilterTargetData } from '../types';

export const Filter = function (
  filter: FilterTargetData['filter'],
  { overwriteGlobal = false }: Partial<Omit<FilterTargetData, 'filter'>> = {},
) {
  return function (target: Constructor<any>['prototype'], propertyKey: string) {
    filterTargetMetadata.setData(target, propertyKey, {
      filter,
      overwriteGlobal,
    });
  };
};
