import { type FC, type PropsWithChildren, useEffect, useState } from "react";
import { IntlProvider as ReactIntlProvider } from "react-intl";

import { db, dbStorage } from "../db/state";
import { useValue } from "../lib/db/react";
import {
  baseMessages,
  loadMessages,
  type LocaleMessages,
  resolveLocale,
} from "./locales";

const IntlProvider: FC<PropsWithChildren> = ({ children }) => {
  const locale = useValue(db, "locale");
  const [messages, setMessages] = useState<LocaleMessages | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Wait for storage to hydrate before loading messages so we use the
    // persisted locale rather than the init default.
    (async () => {
      await dbStorage.catch(() => {});
      try {
        const nextMessages = await loadMessages(locale);
        if (!cancelled) {
          setMessages({ ...baseMessages, ...nextMessages });
        }
      } catch (error) {
        console.error(`Failed to load locale "${locale}":`, error);
        if (!cancelled) {
          setMessages(baseMessages);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (!messages) return null;

  return (
    <ReactIntlProvider
      locale={resolveLocale(locale)}
      defaultLocale="en"
      messages={messages}
    >
      {children}
    </ReactIntlProvider>
  );
};

export default IntlProvider;
