import { Constructor } from './Constructor';

export type Module = Constructor<any> | Constructor<any>['prototype'];
