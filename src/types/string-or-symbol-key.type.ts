export type StringOrSymbolKey<T> = Extract<keyof T, string | symbol>;
