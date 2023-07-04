import { TRANSFORMER } from './TRANSFORMER';

type KeyName = keyof typeof TRANSFORMER;

export const form = (keyOrKeys: KeyName | KeyName[]): any => {
  const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
  return (value: any) =>
    keys.reduce((value, key) => TRANSFORMER[key](value), value);
};
