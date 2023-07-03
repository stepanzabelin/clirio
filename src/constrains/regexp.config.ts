export const actionReg = /(?<action>[a-z][a-z0-9\-_:.|]*)/;
export const moduleCommandReg = /(?<action>[a-z][a-z0-9\-_]*)/;
export const optionReg =
  /(?<option>(-(?<shortName>[a-z])|--(?<longName>[a-z][a-z0-9\-_.]+)))/;
export const paramReg = /<(?<rest>\.\.\.)?(?<param>[a-z][a-z0-9\-_]+)>/;
export const argReg = new RegExp(
  `^\\s*(${actionReg.source}|${optionReg.source}|${paramReg.source})\\s*`,
  'i'
);
