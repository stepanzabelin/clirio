import { Pipe } from './pipe.type';

export type PipeScope = {
  scope: 'global' | 'action';
  pipe: Pipe;
};
