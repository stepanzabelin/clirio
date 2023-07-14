import { Constructor } from './constructor.type';
import { DataTypeEnum } from './data-type-enum.type';
import { Row } from './row.type';

export type PipeContext = {
  dataType: DataTypeEnum;
  dto: Constructor;
  scope: 'global' | 'command';
  rows: Row[];
};
