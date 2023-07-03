export type MappedLink = {
  type: 'param' | 'option';
  key: string;
  definedKeys: string[];
  propertyName: string | null;
  value: any;
  mapped: boolean;
};
