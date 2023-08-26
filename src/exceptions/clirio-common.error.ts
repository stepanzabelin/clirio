type Data = {
  code?: string;
  [key: string]: any;
};

export class ClirioCommonError extends Error {
  public readonly code?: string;

  constructor(
    message: string,
    public readonly data: Data = {},
  ) {
    super(message);
    this.name = 'ClirioCommonError';
    Object.assign(this, data);
  }
}
