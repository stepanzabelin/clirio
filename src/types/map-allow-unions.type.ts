import { AllowUnions } from './allow-unions.type';

export type MapAllowUnions<TObject, TKey extends keyof TObject, TDesired> = {
  [K in TKey]: AllowUnions<TObject[K], TDesired, TObject[K]>;
};
