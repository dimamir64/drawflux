import { MENU_PANEL_ACTIONS } from '@/client/shared/constants/menu';
import { useClickAway } from '@/client/shared/hooks/useClickAway';
import { ICON_SIZES } from '@/client/shared/styles/theme';
import { useRef, useState } from 'react';
import { IoEllipsisHorizontal } from 'react-icons/io5';
import Button from '@/client/components/Button/Button';
import {
  MenuPanelToggle,
  MenuPanelContent,
  MenuPanelContainer,
} from './MenuPanelStyled';

export type MenuPanelActionType = (typeof MENU_PANEL_ACTIONS)[number]['key'];

type Props = {
  onAction: (type: MenuPanelActionType) => void;
};

const MenuPanel = ({ onAction }: Props) => {
  const [open, setOpen] = useState(Boolean(false));

  const menuRef = useRef<HTMLDivElement>(null);

  useClickAway(menuRef, () => setOpen(false));

  const handleOnToggle = () => {
    setOpen((prevState) => !prevState);
  };

  const handleOnClick = (type: MenuPanelActionType) => {
    onAction(type);
    setOpen(false);
  };

  return (
    <MenuPanelContainer ref={menuRef}>
      <MenuPanelToggle
        title="Toggle Menu"
        size="small"
        squared={true}
        onClick={handleOnToggle}
      >
        <IoEllipsisHorizontal size={ICON_SIZES.LARGE} />
      </MenuPanelToggle>
      {open && (
        <MenuPanelContent data-testid="menu-panel-content">
          {MENU_PANEL_ACTIONS.map((action) => {
            return (
              <Button
                key={action.key}
                title={action.name}
                fullWidth={true}
                size="small"
                color="secondary-light"
                onClick={() => handleOnClick(action.key)}
              >
                {action.icon({ size: ICON_SIZES.LARGE })}
                {action.name}
              </Button>
            );
          })}
        </MenuPanelContent>
      )}
    </MenuPanelContainer>
  );
};

export default MenuPanel;
