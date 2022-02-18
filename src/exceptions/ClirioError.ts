type ErrorTrace = {
  title?: string;
};

export class ClirioError extends Error {
  constructor(message: string, public readonly trace: ErrorTrace = {}) {
    super(message);
    this.name = 'ClirioError';
  }

  public format() {
    let output = '';

    if (this.trace.title) {
      output += `[${this.trace.title}]: `;
    }

    if (this.message) {
      output += this.message;
    }

    return output;
  }
}
