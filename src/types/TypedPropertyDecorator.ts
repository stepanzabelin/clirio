import { MapAllowUnions } from './MapAllowUnions';
import { StringOrSymbolKey } from './StringOrSymbolKey';

export type TypedPropertyDecorator<TPropertyType> = <
  TClass extends MapAllowUnions<TClass, TKey, TPropertyType>,
  TKey extends StringOrSymbolKey<TClass>
>(
  target: TClass,
  propertyKey: TKey
) => void;
