const formatParam = (param: string, value: string): string => {
  const col1 = `[${param}]:`.padEnd(12, ' ');
  return `${col1} ${value}`;
};

export const devError = (
  message: string,
  {
    entity,
    property,
    value,
    decorator,
  }: {
    entity?: string;
    property?: string;
    value?: string;
    decorator?: string;
  } = {}
) => {
  console.log(
    '\x1b[31m%s\x1b[0m',
    formatParam('debug', message + (value ? `: ${value}` : ''))
  );

  if (entity) {
    console.log('\x1b[33m%s\x1b[0m', formatParam('entity', entity));
  }

  if (property) {
    console.log('\x1b[33m%s\x1b[0m', formatParam('property', property));
  }

  if (decorator) {
    console.log('\x1b[33m%s\x1b[0m', formatParam('decorator', decorator));
  }

  process.exit(0);
};
