export class ClirioWarning extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClirioWarning';
  }
}
