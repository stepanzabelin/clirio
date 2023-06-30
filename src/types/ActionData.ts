import { ActionType } from './ActionType';
import { Link } from './Link';

export type ActionTargetData = {
  links: Link[];
  command: string | null;
  type: ActionType;
};
