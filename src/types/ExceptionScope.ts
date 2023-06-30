import { Exception } from './Exception';

export type ExceptionScope = {
  scope: 'global' | 'route';
  exception: Exception;
};
