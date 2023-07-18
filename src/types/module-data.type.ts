import { Link } from './link.type';

export type ModuleData = {
  command: string | null;
  links: Link[];
  description: string | null;
  hidden: boolean;
};
