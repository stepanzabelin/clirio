import { InputTypeEnum } from './input-type-enum.type';
import { Constructor } from './constructor.type';

export type EnvsArgData = {
  type: InputTypeEnum.Envs;
  entity: Constructor<any>;
};
