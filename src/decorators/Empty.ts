import { md } from '../metadata';
import { ActionType, Constructor } from '../types';

export const Empty = function () {
  return function (target: Constructor['prototype'], propertyKey: string) {
    md.action.setData(target, propertyKey, {
      type: ActionType.Empty,
      links: [],
      command: null,
    });
  };
};
