export type AllowUnions<TType, TDesired, TOriginal> = TType extends TDesired
  ? TOriginal
  : TDesired;
