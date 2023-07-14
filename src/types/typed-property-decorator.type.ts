import { MapAllowUnions } from './map-allow-unions.type';
import { StringOrSymbolKey } from './string-or-symbol-key.type';

export type TypedPropertyDecorator<TPropertyType> = <
  TClass extends MapAllowUnions<TClass, TKey, TPropertyType>,
  TKey extends StringOrSymbolKey<TClass>,
>(
  target: TClass,
  propertyKey: TKey,
) => void;
