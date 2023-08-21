type Data = {
  [key: string]: any;
};

export class ClirioDebugError extends Error {
  constructor(message: string, data: Data = {}) {
    super(message);
    this.name = 'ClirioDebugError';
    Object.assign(this, data);

    this.stack =
      `${this.name}: ${message}\n` +
      Object.entries(data)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join(`\n`);
  }
}
