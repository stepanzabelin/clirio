export type MappedLink = {
  type: 'param' | 'option';
  key: string;
  allowedKeys: string[];
  propertyName: string | null;
  value: any;
  mapped: boolean;
};
