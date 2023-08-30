import { type ReactNode } from 'react';
import { Provider as StoreProvider } from 'react-redux';
import { ModalProvider } from '@/contexts/modal';
import { NotificationsProvider } from '@/contexts/notifications';
import { WebSocketProvider } from '@/contexts/websocket';
import { store } from '@/stores/store';
import { ThemeProvider } from '@/contexts/theme';

type Props = {
  children: ReactNode;
};

export const AppProvider = ({ children }: Props) => {
  return (
    <ThemeProvider>
      <StoreProvider store={store}>
        <ModalProvider>
          <NotificationsProvider>
            <WebSocketProvider>{children}</WebSocketProvider>
          </NotificationsProvider>
        </ModalProvider>
      </StoreProvider>
    </ThemeProvider>
  );
};
