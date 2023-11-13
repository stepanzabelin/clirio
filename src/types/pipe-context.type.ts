import { Constructor } from './constructor.type';
import { DataTypeEnum } from './data-type-enum.type';

export type PipeContext = {
  dataType: DataTypeEnum;
  entity: Constructor<any>;
  scope: 'global' | 'action';
};
