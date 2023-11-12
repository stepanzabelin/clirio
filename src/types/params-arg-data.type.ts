import { Constructor } from './constructor.type';
import { InputTypeEnum } from './input-type-enum.type';

export type ParamsArgData = {
  type: InputTypeEnum.params;
  entity: Constructor<any>;
};
