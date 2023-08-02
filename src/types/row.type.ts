export type Row = {
  type: 'param' | 'option';
  key: string;
  value: any;
  definedKeys: string[];
  propertyName: string | null;
  mapped: boolean;
};
