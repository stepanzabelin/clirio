type Options = {
  errCode: string;
};

type Data = {
  [key: string]: any;
};

export class ClirioCommonError extends Error {
  public readonly errCode!: string;

  constructor(
    message: string,
    options: Options,
    public readonly data: Data = {},
  ) {
    super(message);
    this.name = 'ClirioCommonError';
    Object.assign(this, options);
  }
}
