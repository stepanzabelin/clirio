type DebugTrace = {
  entity?: string;
  property?: string;
  value?: string;
  decorator?: string;
};

export class ClirioDebug extends Error {
  constructor(message: string, public readonly trace: DebugTrace = {}) {
    super(message);
    this.name = 'ClirioDebug';
  }

  private formatParam(param: string, value: string): string {
    const col1 = `[${param}]:`.padEnd(12, ' ');
    return `${col1} ${value}`;
  }

  public format() {
    let output = '';

    output += this.formatParam(
      'debug',
      this.message + (this.trace.value ? `: ${this.trace.value}` : '')
    );

    if (this.trace.entity) {
      output += `\n` + this.formatParam('entity', this.trace.entity);
    }

    if (this.trace.property) {
      output += `\n` + this.formatParam('property', this.trace.property);
    }

    if (this.trace.decorator) {
      output += `\n` + this.formatParam('decorator', this.trace.decorator);
    }

    return output;
  }

  public static fatal(message: string, trace: DebugTrace = {}): never {
    const output = new ClirioDebug(message, trace).format();
    console.log('\x1b[31m%s\x1b[0m', output);
    process.exit(5);
  }
}
