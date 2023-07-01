export const actionReg = /(?<action>[a-z][a-z0-9\-_:.|]*)/;
export const moduleCommandReg = /(?<action>[a-z][a-z0-9\-_]*)/;
export const optionReg =
  /(?<option>(-(?<shortName>[a-z])|--(?<longName>[a-z][a-z0-9\-_.]+)))/;
export const maskReg = /<(?<rest>\.\.\.)?(?<value>[a-z][a-z0-9\-_]+)>/;
export const argReg = new RegExp(
  `^\\s*(${actionReg.source}|${optionReg.source}|${maskReg.source})\\s*`,
  'i'
);
