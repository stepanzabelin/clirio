import { pipeTargetMetadata } from '../metadata';
import { Constructor, PipeTargetData } from '../types';

export const Pipe = function (
  pipe: PipeTargetData['pipe'],
  { overwriteGlobal = false }: Partial<Omit<PipeTargetData, 'pipe'>> = {}
) {
  return function (target: Constructor['prototype'], propertyKey: string) {
    pipeTargetMetadata.setData(target, propertyKey, {
      pipe,
      overwriteGlobal,
    });
  };
};
