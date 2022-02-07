import { md } from '../metadata';
import { Constructor, InputTypeEnum } from '../types';

export const Options = function () {
  return function (
    target: Constructor,
    propertyName: string,
    inputIndex: number
  ) {
    md.input.define(target, propertyName, inputIndex, InputTypeEnum.Options);
  };
};
