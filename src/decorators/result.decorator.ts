import { resultTargetMetadata } from '../metadata';
import { Constructor, ResultTargetData } from '../types';

export const Result = function (
  result: ResultTargetData['result'],
  { overwriteGlobal = false }: Partial<Omit<ResultTargetData, 'result'>> = {},
) {
  return function (target: Constructor<any>['prototype'], propertyKey: string) {
    resultTargetMetadata.setData(target, propertyKey, {
      result,
      overwriteGlobal,
    });
  };
};
