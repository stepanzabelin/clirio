import { ActionType } from './action-type.type';
import { Link } from './link.type';

export type ActionTargetData = {
  links: Link[];
  command: string | null;
  type: ActionType;
};
