import { Constructor } from './Constructor';

export type ResultContext = {
  moduleName: Constructor;
  scope: 'global' | 'action';
};
