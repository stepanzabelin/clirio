import { Constructor } from './Constructor';
import { DataTypeEnum } from './DataTypeEnum';
import { Row } from './Row';

export type PipeContext = {
  dataType: DataTypeEnum;
  dto: Constructor;
  scope: 'global' | 'command';
  rows: Row[];
};
