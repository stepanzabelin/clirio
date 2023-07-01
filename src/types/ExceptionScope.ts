import { Exception } from './Exception';

export type ExceptionScope = {
  scope: 'global' | 'action';
  exception: Exception;
};
