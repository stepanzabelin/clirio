import { paramTargetMetadata } from '../metadata';
import { Constructor, ParamTargetData } from '../types';

export const Param = function (
  key: ParamTargetData['key'] = null,
  { cast = null }: Partial<Omit<ParamTargetData, 'key'>> = {},
) {
  return function (
    target: Constructor<any>['prototype'],
    propertyName: string,
  ) {
    paramTargetMetadata.setData(target, propertyName, {
      key,
      cast,
    });
  };
};
