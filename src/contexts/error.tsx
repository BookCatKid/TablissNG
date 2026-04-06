import {
  createContext,
  type FC,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { capture, onError } from "../errorHandler";

type ErrorAPI = {
  errors: ErrorItem[];
  push: (error: Omit<ErrorItem, "timestamp">) => void;
};

type ErrorItem = {
  message: string;
  timestamp: string;
};

type ErrorState = {
  errors: ErrorItem[];
};

export const ErrorContext = createContext<ErrorAPI>(null as any);

const ErrorProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<ErrorState>({ errors: [] });
  const push = useCallback((error: Omit<ErrorItem, "timestamp">) => {
    capture(new Error(error.message));
  }, []);

  // Subscribe to all captured errors (from push, error boundaries, global handlers)
  useEffect(() => {
    return onError((entry) => {
      setState((prev) => ({
        ...prev,
        errors: prev.errors.concat({
          message: entry.message,
          timestamp: entry.timestamp,
        }),
      }));
    });
  }, []);

  return (
    <ErrorContext.Provider value={{ ...state, push }}>
      {children}
    </ErrorContext.Provider>
  );
};

/** Push error to the error log */
export const usePushError = (): ErrorAPI["push"] =>
  useContext(ErrorContext).push;

export default ErrorProvider;
