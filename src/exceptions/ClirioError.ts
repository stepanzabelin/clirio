type Payload = {
  errCode: string;
  [key: string]: any;
};

export class ClirioError extends Error {
  constructor(message: string, public readonly payload: Payload) {
    super(message);
    this.name = 'ClirioError';
  }
}
