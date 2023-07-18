import { ActionType } from './action-type.type';
import { Link } from './link.type';

export type ActionTargetData = {
  links: Link[];
  command: string;
  type: ActionType;
  description: string | null;
  hidden: boolean;
};
