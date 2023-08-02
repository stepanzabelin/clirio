import { DataTypeEnum } from '../types';

type Params = {
  dataType: DataTypeEnum;
  propertyName: string;
};

export class ClirioValidationError extends Error {
  public propertyName: string | null;
  public dataType: DataTypeEnum;

  constructor(message: string, params: Params) {
    super(message);
    this.name = 'ClirioValidationError';
    this.propertyName = params.propertyName;
    this.dataType = params.dataType;
  }
}
