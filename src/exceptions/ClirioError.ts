export class ClirioError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClirioError';
  }
}
