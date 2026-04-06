import {
  createContext,
  type FC,
  type PropsWithChildren,
  useMemo,
  useState,
} from "react";

type UiState = {
  errors: boolean;
  pending: number;
  settings: boolean;
};

type UiContext = UiState & {
  pushLoader: () => void;
  popLoader: () => void;
  toggleErrors: () => void;
  toggleSettings: () => void;
};

export const UiContext = createContext({} as unknown as UiContext);

const UiProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<UiState>({
    errors: false,
    pending: 0,
    settings: false,
  });

  const methods = useMemo(
    () => ({
      pushLoader: () =>
        setState((state) => ({ ...state, pending: state.pending + 1 })),
      popLoader: () =>
        setState((state) => ({ ...state, pending: state.pending - 1 })),
      toggleErrors: () =>
        setState((state) => ({ ...state, errors: !state.errors })),
      toggleSettings: () =>
        setState((state) => ({ ...state, settings: !state.settings })),
    }),
    [],
  );

  return (
    <UiContext.Provider value={{ ...state, ...methods }}>
      {children}
    </UiContext.Provider>
  );
};

export default UiProvider;
