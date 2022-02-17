type ClirioTrace = {
  entity?: string;
  property?: string;
  value?: string;
  decorator?: string;
};

export class ClirioDebug extends Error {
  constructor(message: string, private readonly trace: ClirioTrace = {}) {
    super(message);
    this.name = 'ClirioDebug';
  }

  private formatParam(param: string, value: string): string {
    const col1 = `[${param}]:`.padEnd(12, ' ');
    return `${col1} ${value}`;
  }

  public output() {
    console.log(
      '\x1b[31m%s\x1b[0m',
      this.formatParam(
        'debug',
        this.message + (this.trace.value ? `: ${this.trace.value}` : '')
      )
    );

    if (this.trace.entity) {
      console.log(
        '\x1b[33m%s\x1b[0m',
        this.formatParam('entity', this.trace.entity)
      );
    }

    if (this.trace.property) {
      console.log(
        '\x1b[33m%s\x1b[0m',
        this.formatParam('property', this.trace.property)
      );
    }

    if (this.trace.decorator) {
      console.log(
        '\x1b[33m%s\x1b[0m',
        this.formatParam('decorator', this.trace.decorator)
      );
    }
  }

  public static fatal(message: string, trace: ClirioTrace = {}): never {
    new ClirioDebug(message, trace).output();
    process.exit(5);
  }
}
