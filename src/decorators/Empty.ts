import { actionTargetMetadata } from '../metadata';
import { ActionType, Constructor } from '../types';

export const Empty = function () {
    return function (
        target: Constructor<any>['prototype'],
        propertyKey: string,
    ) {
        actionTargetMetadata.setData(target, propertyKey, {
            type: ActionType.Empty,
            links: [],
            command: null,
        });
    };
};
