import { DataTypeEnum } from '../types';

type Data = {
  dataType: DataTypeEnum;
  propertyName?: string;
  key?: string;
};

export class ClirioValidationError extends Error {
  public propertyName: string | null;
  public key: string | null;
  public dataType: DataTypeEnum;

  constructor(message: string, data: Data) {
    super(message);
    this.name = 'ClirioValidationError';
    this.propertyName = data.propertyName ?? null;
    this.key = data.key ?? null;
    this.dataType = data.dataType;
  }
}
