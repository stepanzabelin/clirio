import { Constructor } from './constructor.type';
import { InputTypeEnum } from './input-type-enum.type';

export type OptionsArgData = {
  type: InputTypeEnum.options;
  entity: Constructor<any>;
};
