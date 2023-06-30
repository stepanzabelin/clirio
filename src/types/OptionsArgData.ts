import { InputTypeEnum } from './InputTypeEnum';
import { Constructor } from './Constructor';

export type OptionsArgData = {
  type: InputTypeEnum.Options;
  dto: Constructor<any>;
};
