import { Constructor } from './constructor.type';
import { DataTypeEnum } from './data-type-enum.type';
import { Row } from './row.type';

export type PipeContext = {
  dataType: DataTypeEnum;
  entity: Constructor<any>;
  scope: 'global' | 'action';
  rows: Row[];
};
