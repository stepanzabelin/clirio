import { Clirio } from '@clirio';

describe('Clirio.form', () => {
  it('1.1 transforms NUMBER and STRING values', () => {
    expect(Clirio.form.NUMBER('15')).toBe(15);
    expect(Clirio.form.NUMBER(undefined)).toBe(0);
    expect(Clirio.form.NUMBER('abc')).toBe(0);

    expect(Clirio.form.STRING('hello')).toBe('hello');
    expect(Clirio.form.STRING(15)).toBe('15');
    expect(Clirio.form.STRING(undefined)).toBe('');
  });

  it('1.2 transforms BOOLEAN and FLAG values', () => {
    expect(Clirio.form.BOOLEAN(true)).toBe(true);
    expect(Clirio.form.BOOLEAN(0)).toBe(false);
    expect(Clirio.form.BOOLEAN('false')).toBe(true);

    expect(Clirio.form.FLAG(null)).toBe(true);
    expect(Clirio.form.FLAG('true')).toBe(true);
    expect(Clirio.form.FLAG('false')).toBe(false);
    expect(Clirio.form.FLAG(undefined)).toBe(false);
  });

  it('1.3 transforms KEY_VALUE values into plain objects', () => {
    const single = Clirio.form.KEY_VALUE('DB_NAME=db-name');
    const multiple = Clirio.form.KEY_VALUE([
      'DB_NAME=db-name',
      'DB_TABLE=db-table',
      'DB_SSL',
      'DB_PASS=',
    ]);
    const special = Clirio.form.KEY_VALUE([
      '__proto__=polluted',
      'constructor=ctor',
    ]);

    expect(single).toStrictEqual({
      DB_NAME: 'db-name',
    });

    expect(multiple).toStrictEqual({
      DB_NAME: 'db-name',
      DB_TABLE: 'db-table',
      DB_SSL: null,
      DB_PASS: '',
    });

    expect(Object.getPrototypeOf(special)).toBe(Object.prototype);
    expect(Object.prototype.hasOwnProperty.call(special, '__proto__')).toBe(
      true,
    );
    expect(special['__proto__']).toBe('polluted');
    expect(Object.prototype.hasOwnProperty.call(special, 'constructor')).toBe(
      true,
    );
    expect(special.constructor).toBe('ctor');
    expect(({} as Record<string, string>).polluted).toBeUndefined();
  });

  it('1.4 transforms ARRAY and PLAIN values', () => {
    const values = ['first', 'second'];

    expect(Clirio.form.ARRAY(undefined)).toStrictEqual([]);
    expect(Clirio.form.ARRAY('one')).toStrictEqual(['one']);
    expect(Clirio.form.ARRAY(values)).toBe(values);

    expect(Clirio.form.PLAIN(undefined)).toBeUndefined();
    expect(Clirio.form.PLAIN(null)).toBeNull();
    expect(Clirio.form.PLAIN('one')).toBe('one');
    expect(Clirio.form.PLAIN(values)).toBe('first');
  });
});
