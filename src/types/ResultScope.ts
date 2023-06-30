import { Result } from './Result';

export type ResultScope = {
  scope: 'global' | 'route';
  result: Result;
};
