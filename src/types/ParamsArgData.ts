import { InputTypeEnum } from './InputTypeEnum';
import { Constructor } from './Constructor';

export type ParamsArgData = {
  type: InputTypeEnum.Params;
  dto: Constructor<any>;
};
