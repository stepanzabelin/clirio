import { ArgPattern } from './arg-pattern.type';

export type ModuleData = {
  command: string | null;
  links: ArgPattern[];
  description: string | null;
  hidden: boolean;
};
