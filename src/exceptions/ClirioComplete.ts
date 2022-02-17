export class ClirioComplete extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'ClirioComplete';
  }
}
