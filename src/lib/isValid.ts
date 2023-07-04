import { Validation } from '../types';
import { VALIDATOR } from './VALIDATOR';

export const isValid = (query: string): Validation => {
  return (value) =>
    query
      .trim()
      .split('|')
      .map((key: string) => key.trim())
      .every((key: string) => VALIDATOR[key](value));
};
