import { Constructor } from './Constructor';
import { DataTypeEnum } from './DataTypeEnum';

export type PipeContext = {
  dataType: DataTypeEnum;
  dto: Constructor;
  scope: 'global' | 'command';
};
