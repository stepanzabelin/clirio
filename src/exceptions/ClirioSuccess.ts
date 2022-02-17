export class ClirioSuccess extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'ClirioSuccess';
  }
}
