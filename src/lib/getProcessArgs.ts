import { Args } from '../types';

export const getProcessArgs = (): Args => {
  return process.argv.slice(2);
};
