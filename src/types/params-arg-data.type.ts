import { InputTypeEnum } from './input-type-enum.type';
import { Constructor } from './constructor.type';

export type ParamsArgData = {
  type: InputTypeEnum.Params;
  dto: Constructor<any>;
};