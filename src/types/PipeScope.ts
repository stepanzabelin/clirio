import { Pipe } from './Pipe';

export type PipeScope = {
  scope: 'global' | 'command';
  pipe: Pipe;
};
