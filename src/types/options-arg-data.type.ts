import { InputTypeEnum } from './input-type-enum.type';
import { Constructor } from './constructor.type';

export type OptionsArgData = {
  type: InputTypeEnum.Options;
  entity: Constructor<any>;
};
