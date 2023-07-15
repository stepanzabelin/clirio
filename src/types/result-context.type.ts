import { Constructor } from './constructor.type';

export type ResultContext = {
  moduleName: Constructor;
  scope: 'global' | 'command';
};
