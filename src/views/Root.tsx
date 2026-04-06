import { type FC, StrictMode } from "react";

import ErrorProvider from "../contexts/error";
import TimeProvider from "../contexts/time";
import UiProvider from "../contexts/ui";
import IntlProvider from "../locales/IntlProvider";
import App from "./App";

const Root: FC = () => (
  <StrictMode>
    <ErrorProvider>
      <UiProvider>
        <IntlProvider>
          <TimeProvider>
            <App />
          </TimeProvider>
        </IntlProvider>
      </UiProvider>
    </ErrorProvider>
  </StrictMode>
);

export default Root;
