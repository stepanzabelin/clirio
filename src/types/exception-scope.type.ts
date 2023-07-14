import { Exception } from './exception.type';

export type ExceptionScope = {
  scope: 'global' | 'command';
  exception: Exception;
};
