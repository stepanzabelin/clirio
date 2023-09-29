export type Row = {
  type: 'param' | 'option' | 'env';
  key: string;
  value: any;
  definedKeys: string[];
  propertyName: string | null;
  mapped: boolean;
};
