import { useEffect, useState } from "react";
import { Inbox, UseInboxParams } from "./types";

export function useInbox({
  fetchToken,
  fetchInbox,
  accessTokenKey,
}: UseInboxParams) {
  const [token, setToken] = useState<string | null>(null);
  const [inbox, setInbox] = useState<Inbox>(null);
  const [loading, setLoading] = useState<boolean>(true);

  async function loadInbox(currentToken: string) {
    setLoading(true);

    const items = await fetchInbox(currentToken);
    setInbox(items);

    setLoading(false);
  }

  async function loadToken() {
    const result = await browser.storage.local.get(accessTokenKey);
    if (result[accessTokenKey]) {
      setToken(result[accessTokenKey] as string);
    }
  }

  async function authenticate() {
    const { access_token } = await fetchToken();
    setToken(access_token);
    await browser.storage.local.set({ [accessTokenKey]: access_token });
  }

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    loadInbox(token);
  }, [token]);

  return { authenticate, loading, inbox };
}
