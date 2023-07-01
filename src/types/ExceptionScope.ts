import { Exception } from './Exception';

export type ExceptionScope = {
  scope: 'global' | 'command';
  exception: Exception;
};
