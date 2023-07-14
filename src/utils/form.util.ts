import { transformations } from './transformations.util';

type KeyName = keyof typeof transformations;

export const form = (keyOrKeys: KeyName | KeyName[]): any => {
  const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
  return (value: any) =>
    keys.reduce((value, key) => transformations[key](value), value);
};
