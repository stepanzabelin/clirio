import { Pipe } from './pipe.type';

export type PipeScope = {
  scope: 'global' | 'command';
  pipe: Pipe;
};
