import { Pipe } from './Pipe';

export type PipeScope = {
  scope: 'global' | 'action';
  pipe: Pipe;
};
