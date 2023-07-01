import { Constructor } from './Constructor';
import { DataTypeEnum } from './DataTypeEnum';

export type ExceptionContext = {
  dataType: DataTypeEnum | null;
  dto: Constructor | null;
  scope: 'global' | 'action' | 'default';
};
