import { ArgPattern } from './arg-pattern.type';

export type CommandTargetData = {
  command: string;
  links: ArgPattern[];
  description: string | null;
  hidden: boolean;
};
