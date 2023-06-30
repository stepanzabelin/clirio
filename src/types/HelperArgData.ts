import { InputTypeEnum } from './InputTypeEnum';
import { Constructor } from './Constructor';

export type HelperArgData = {
  type: InputTypeEnum.Helper;
  dto: Constructor<any>;
};
