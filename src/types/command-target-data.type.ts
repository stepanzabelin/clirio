import { Link } from './link.type';

export type CommandTargetData = {
  command: string;
  links: Link[];
  description: string | null;
  hidden: boolean;
};
