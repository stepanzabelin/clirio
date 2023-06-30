import { Pipe } from './Pipe';

export type PipeScope = {
  scope: 'global' | 'route';
  pipe: Pipe;
};
