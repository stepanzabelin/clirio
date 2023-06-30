export class ClirioRouteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClirioRouteError';
  }
}
