import { md } from '../metadata';
import { Constructor, InputTypeEnum } from '../types';

export const Helper = function () {
  return function (
    target: Constructor,
    propertyName: string,
    argIndex: number
  ) {
    md.input.define(target, propertyName, argIndex, InputTypeEnum.Helper);
  };
};
