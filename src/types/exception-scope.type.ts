import { Exception } from './exception.type';

export type ExceptionScope = {
  scope: 'global' | 'action';
  exception: Exception;
};
