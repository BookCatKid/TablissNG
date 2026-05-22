import React from "react";

type UiState = {
  errors: boolean;
  pending: number;
  settings: boolean;
  addWidgetOpen: boolean;
  codeEditorTarget: { widgetId: string; widgetKey: string } | null;
  textEditorTarget: { widgetId: string; widgetKey: string } | null;
  hotkeysPaused: boolean;
};

type UiContext = UiState & {
  pushLoader: () => void;
  popLoader: () => void;
  toggleErrors: () => void;
  toggleSettings: () => void;
  toggleAddWidget: () => void;
  openAddWidget: () => void;
  closeAddWidget: () => void;
  openCodeEditor: (widgetId: string, widgetKey: string) => void;
  closeCodeEditor: () => void;
  openTextEditor: (widgetId: string, widgetKey: string) => void;
  closeTextEditor: () => void;
  setHotkeysPaused: (value: boolean) => void;
};

export const UiContext = React.createContext({} as unknown as UiContext);

const UiProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [state, setState] = React.useState<UiState>({
    errors: false,
    pending: 0,
    settings: false,
    addWidgetOpen: false,
    codeEditorTarget: null,
    textEditorTarget: null,
    hotkeysPaused: false,
  });

  const methods = React.useMemo(
    () => ({
      pushLoader: () =>
        setState((state) => ({ ...state, pending: state.pending + 1 })),
      popLoader: () =>
        setState((state) => ({ ...state, pending: Math.max(0, state.pending - 1) })),
      toggleErrors: () =>
        setState((state) => ({ ...state, errors: !state.errors })),
      toggleSettings: () =>
        setState((state) => ({ ...state, settings: !state.settings })),
      toggleAddWidget: () =>
        setState((state) => ({ ...state, addWidgetOpen: !state.addWidgetOpen })),
      openAddWidget: () =>
        setState((state) => ({ ...state, addWidgetOpen: true })),
      closeAddWidget: () =>
        setState((state) => ({ ...state, addWidgetOpen: false })),
      openCodeEditor: (widgetId: string, widgetKey: string) =>
        setState((state) => ({
          ...state,
          codeEditorTarget: { widgetId, widgetKey },
        })),
      closeCodeEditor: () =>
        setState((state) => ({ ...state, codeEditorTarget: null })),
      openTextEditor: (widgetId: string, widgetKey: string) =>
        setState((state) => ({
          ...state,
          textEditorTarget: { widgetId, widgetKey },
        })),
      closeTextEditor: () =>
        setState((state) => ({ ...state, textEditorTarget: null })),
      setHotkeysPaused: (value: boolean) =>
        setState((state) => ({ ...state, hotkeysPaused: value })),
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
