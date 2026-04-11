import { Clirio } from '@clirio';

const runChecks = (
  checks: Array<(value: any) => boolean | null>,
  value: any,
): boolean | null => {
  for (const check of checks) {
    const result = check(value);

    if (result === false) {
      return false;
    }

    if (result === true) {
      return true;
    }
  }

  return null;
};

describe('Clirio.valid', () => {
  describe('built-in checks', () => {
    it('1.1 validates OPTIONAL, REQUIRED, NULLABLE, and NULL', () => {
      expect(Clirio.valid.OPTIONAL(undefined)).toBe(true);
      expect(Clirio.valid.OPTIONAL('value')).toBeNull();

      expect(Clirio.valid.REQUIRED(undefined)).toBe(false);
      expect(Clirio.valid.REQUIRED(null)).toBe(false);
      expect(Clirio.valid.REQUIRED('value')).toBeNull();

      expect(Clirio.valid.NULLABLE(null)).toBe(true);
      expect(Clirio.valid.NULLABLE('value')).toBeNull();

      expect(Clirio.valid.NULL(null)).toBe(true);
      expect(Clirio.valid.NULL('value')).toBe(false);
    });

    it('1.2 validates primitive-like checks', () => {
      expect(Clirio.valid.STRING('value')).toBe(true);
      expect(Clirio.valid.STRING(15)).toBe(false);

      expect(Clirio.valid.NUMBER(15)).toBe(true);
      expect(Clirio.valid.NUMBER('15')).toBe(true);
      expect(Clirio.valid.NUMBER('abc')).toBe(false);

      expect(Clirio.valid.INTEGER(15)).toBe(true);
      expect(Clirio.valid.INTEGER(15.5)).toBe(false);
      expect(Clirio.valid.INTEGER('15')).toBe(false);

      expect(Clirio.valid.BOOLEAN(true)).toBe(true);
      expect(Clirio.valid.BOOLEAN('false')).toBe(true);
      expect(Clirio.valid.BOOLEAN('hello')).toBe(false);

      expect(Clirio.valid.FLAG(null)).toBe(true);
      expect(Clirio.valid.FLAG('true')).toBe(true);
      expect(Clirio.valid.FLAG('false')).toBe(true);
      expect(Clirio.valid.FLAG(undefined)).toBe(false);
    });

    it('1.3 validates KEY_VALUE values', () => {
      expect(Clirio.valid.KEY_VALUE('DB_NAME=db-name')).toBe(true);
      expect(Clirio.valid.KEY_VALUE('DB_SSL')).toBe(true);
      expect(
        Clirio.valid.KEY_VALUE(['DB_NAME=db-name', 'DB_TABLE=db-table']),
      ).toBe(true);
      expect(Clirio.valid.KEY_VALUE(['DB_NAME=db-name', null])).toBe(true);
      expect(Clirio.valid.KEY_VALUE('')).toBe(false);
    });
  });

  describe('validation chains', () => {
    it('2.1 short-circuits OPTIONAL before stricter checks', () => {
      const checks = [Clirio.valid.OPTIONAL, Clirio.valid.NUMBER];

      expect(runChecks(checks, undefined)).toBe(true);
      expect(runChecks(checks, '15')).toBe(true);
      expect(runChecks(checks, 'abc')).toBe(false);
    });

    it('2.2 short-circuits NULLABLE before stricter checks', () => {
      const checks = [Clirio.valid.NULLABLE, Clirio.valid.STRING];

      expect(runChecks(checks, null)).toBe(true);
      expect(runChecks(checks, 'text')).toBe(true);
      expect(runChecks(checks, 15)).toBe(false);
    });

    it('2.3 enforces REQUIRED before content validation', () => {
      const checks = [Clirio.valid.REQUIRED, Clirio.valid.STRING];

      expect(runChecks(checks, undefined)).toBe(false);
      expect(runChecks(checks, null)).toBe(false);
      expect(runChecks(checks, 'text')).toBe(true);
    });

    it('2.4 supports multiple KEY_VALUE entries in a chain', () => {
      const checks = [Clirio.valid.OPTIONAL, Clirio.valid.KEY_VALUE];

      expect(runChecks(checks, undefined)).toBe(true);
      expect(runChecks(checks, ['DB_NAME=db-name', 'DB_TABLE=db-table'])).toBe(
        true,
      );
      expect(runChecks(checks, ['DB_NAME=db-name', 'DB_SSL'])).toBe(true);
      expect(runChecks(checks, '')).toBe(false);
    });
  });
});
