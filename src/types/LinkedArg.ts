import { LinkType } from './LinkType';

export type LinkedArg = {
  type: 'param' | 'option';
  key: string;
  allowedKeys: string[];
  property: string | null;
  value: (string | null) | (string | null)[];
  transformed: boolean;
};
