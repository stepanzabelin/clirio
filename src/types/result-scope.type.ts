import { Result } from './result.type';

export type ResultScope = {
  scope: 'global' | 'command';
  result: Result;
};
