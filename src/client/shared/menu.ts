import { IconType } from 'react-icons';
import { IoTrashOutline } from 'react-icons/io5';
import { NodeColor } from './element';

export const MENU_ACTIONS = {
  DELETE_NODE: 'delete-node',
  SELECT_ALL: 'select-all',
  LOCK_CONTROL_ANCHOR: 'lock-control-anchor',
} as const;

export type MenuItem = {
  key: (typeof MENU_ACTIONS)[keyof typeof MENU_ACTIONS];
  name: string;
  icon?: IconType;
  color?: NodeColor;
  menu?: MenuItem;
};

export const DEFAULT_NODE_MENU: MenuItem[] = [
  {
    key: MENU_ACTIONS.DELETE_NODE,
    name: 'Delete',
    icon: IoTrashOutline,
    color: 'red',
  },
];

export const DEFAULT_MENU: MenuItem[] = [
  {
    key: MENU_ACTIONS.SELECT_ALL,
    name: 'Select All',
  },
];
