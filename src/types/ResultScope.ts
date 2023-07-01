import { Result } from './Result';

export type ResultScope = {
  scope: 'global' | 'command';
  result: Result;
};
