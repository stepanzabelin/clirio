import { actionTargetMetadata } from '../metadata';
import { ActionType, Constructor } from '../types';

export const Failure = function () {
  return function (target: Constructor['prototype'], propertyKey: string) {
    actionTargetMetadata.setData(target, propertyKey, {
      type: ActionType.Failure,
      links: [],
      command: null,
    });
  };
};
