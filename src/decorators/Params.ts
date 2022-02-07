import { md } from '../metadata';
import { Constructor, InputTypeEnum } from '../types';

export const Params = function () {
  return function (
    target: Constructor,
    propertyName: string,
    argIndex: number
  ) {
    md.input.define(target, propertyName, argIndex, InputTypeEnum.Params);
  };
};
