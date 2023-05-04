import { styled } from 'shared';

export const PopoverContainer = styled('div', {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  zIndex: 1,
});

export const PopoverDropdown = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$1',
  boxShadow: '$small',
  padding: '$1',
  borderRadius: '$1',
  marginTop: '$2',
  backgroundColor: '$white',
});
