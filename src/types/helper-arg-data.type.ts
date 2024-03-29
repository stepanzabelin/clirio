import { InputTypeEnum } from './input-type-enum.type';
import { Constructor } from './constructor.type';

export type HelperArgData = {
  type: InputTypeEnum.helper;
  entity: Constructor<any>;
};
