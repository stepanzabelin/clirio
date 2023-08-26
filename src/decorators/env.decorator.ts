import { envTargetMetadata } from '../metadata';
import { Constructor, EnvTargetData } from '../types';

export const Env = function (
  key: EnvTargetData['key'] = null,
  {
    description = null,
    hidden = false,
  }: Partial<Omit<EnvTargetData, 'key'>> = {},
) {
  return function (
    target: Constructor<any>['prototype'],
    propertyName: string,
  ) {
    envTargetMetadata.setData(target, propertyName, {
      key,
      description,
      hidden,
    });
  };
};
