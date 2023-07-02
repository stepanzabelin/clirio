import { DataTypeEnum, LinkedArg } from '../types';

type Payload = {
  dataType: DataTypeEnum;
  [key: string]: any;
} & LinkedArg;

export class ClirioValidationError extends Error {
  public propertyName: string | null;
  public dataType: DataTypeEnum;
  constructor(message: string, public readonly payload: Payload) {
    super(message);
    this.name = 'ClirioValidationError';
    this.propertyName = payload.propertyName;
    this.dataType = payload.dataType;
  }
}
