type Payload = {
  [key: string]: any;
};

export class ClirioDebugError extends Error {
  constructor(message: string, public readonly payload: Payload = {}) {
    super(message);
    this.name = 'ClirioError';
    Object.assign(this, payload);
  }
}
