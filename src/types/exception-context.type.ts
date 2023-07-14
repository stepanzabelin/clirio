import { Constructor } from './constructor.type';
import { DataTypeEnum } from './data-type-enum.type';

export type ExceptionContext = {
  dataType: DataTypeEnum | null;
  dto: Constructor | null;
  scope: 'global' | 'command' | 'default';
};
