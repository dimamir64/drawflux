import { configureStore } from '@reduxjs/toolkit';
import { render, type RenderOptions } from '@testing-library/react';
import { Provider as StoreProvider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import canvasReducer, {
  initialState as initialCanvasState,
} from '@/stores/slices/canvas';
import historyReducer, {
  type CanvasHistoryState,
} from '@/stores/reducers/history';
import collabReducer, {
  initialState as initialCollabState,
} from '@/stores/slices/collaboration';
import { WebSocketProvider } from '@/contexts/websocket';
import type { PropsWithChildren } from 'react';
import type { PreloadedState } from '@reduxjs/toolkit';
import type { RootState } from '@/stores/store';
import type { Options as UserEventOptions } from '@testing-library/user-event/dist/types/options';
import { ThemeProvider } from '@/contexts/theme';
import { NotificationsProvider } from '@/contexts/notifications';
import { ModalProvider } from '@/contexts/modal';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
  store?: ReturnType<typeof setupStore>;
}

export const defaultPreloadedState = {
  canvas: {
    past: [],
    present: initialCanvasState,
    future: [],
  } as CanvasHistoryState,
  collaboration: initialCollabState,
};

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
  return configureStore({
    reducer: {
      canvas: historyReducer(canvasReducer),
      collaboration: collabReducer,
    },
    preloadedState,
  });
};

export const setupTestStore = (
  preloadedState: PreloadedState<RootState> = defaultPreloadedState,
) => {
  const store = setupStore(preloadedState);
  store.dispatch = vi.fn(store.dispatch) as typeof store.dispatch;

  return store;
};

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = defaultPreloadedState,
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {},
  userEventOptions: UserEventOptions = {},
) {
  function Wrapper({
    children,
  }: PropsWithChildren<{ children: React.ReactNode }>) {
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
  }

  return {
    store,
    user: userEvent.setup(userEventOptions),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
