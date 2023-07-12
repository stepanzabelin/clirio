type Payload = {
  [key: string]: any;
};

export class ClirioDebugError extends Error {
  constructor(message: string, public readonly payload: Payload = {}) {
    super(message);
    this.name = 'ClirioDebugError';
    Object.assign(this, payload);

    this.stack =
      `${this.name}: ${message}\n` +
      Object.entries(payload)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join(`\n`);
  }
}
