import { actionTargetMetadata } from '../metadata';
import { ActionType, Constructor } from '../types';

export const Failure = function () {
  return function (target: Constructor<any>['prototype'], propertyKey: string) {
    actionTargetMetadata.setData(target, propertyKey, {
      type: ActionType.Failure,
      links: [],
      command: null,
    });
  };
};
