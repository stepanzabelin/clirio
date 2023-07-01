import { Result } from './Result';

export type ResultScope = {
  scope: 'global' | 'action';
  result: Result;
};
