import { Constructor } from './constructor.type';

export type Module = Constructor<any> | Constructor<any>['prototype'];
