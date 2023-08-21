type Data = {
  errCode?: string;
  code?: string;
  [key: string]: any;
};

export class ClirioCommonError extends Error {
  public readonly errCode!: string;

  constructor(
    message: string,
    public readonly data: Data = {},
  ) {
    super(message);
    this.name = 'ClirioCommonError';
    Object.assign(this, data);
  }
}
