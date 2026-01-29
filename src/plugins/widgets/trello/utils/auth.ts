import { TrelloSession } from "../types";

/**
 * Creates authentication popup then creates and returns session object
 */
export const trelloAuthFlow = async (): Promise<TrelloSession | null> => {
  const SESSION_NAME = "trello";
  const AUTH_URL_BASE = "https://trello.com/1/authorize";
  const params = new URLSearchParams({
    expiration: "30days",
    callback_method: "fragment",
    scope: "read",
    response_type: "token",
    key: TRELLO_API_KEY,
    return_url: browser.identity.getRedirectURL(),
  });

  const AUTH_URL = `${AUTH_URL_BASE}?${params.toString()}`;
  const redirectResponse = await browser.identity.launchWebAuthFlow({
    url: AUTH_URL,
    interactive: true,
  });

  // receive token granted by Trello
  const tokenMatch = redirectResponse.match(/token=([^&]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;

  if (!token) {
    return null;
  }

  // Attempt to clear previous stale session
  let staleSession: TrelloSession | null = null;

  try {
    const obj = await browser.storage.local.get(SESSION_NAME);
    staleSession =
      typeof obj[SESSION_NAME] === "object"
        ? (obj[SESSION_NAME] as TrelloSession)
        : null;
    if (staleSession) {
      await revokeStaleSession(staleSession);
    }
  } catch (error) {
    console.warn(`TRELLO: Failed to clear previous session ${error}`);
  }

  const expiry = Date.now() + 60 * 60 * 24 * 30 * 1000; // tokens live for 1 month
  const self = await fetch(
    `https://api.trello.com/1/members/me?key=${TRELLO_API_KEY}&token=${token}`,
  );
  if (!self.ok) {
    return null;
  }

  const { id } = await self.json();
  return {
    userId: id,
    name: "trello",
    accessToken: token,
    expires: expiry,
  } as TrelloSession;
};

/**
 * Clears current trello session token from user's account to
 * prevent cases where account dashboard is polluted with stale tokens
 */
export const onTrelloSignOut = async (session: TrelloSession) => {
  await revokeStaleSession(session);
};

/**
 * Clears a stale trello session from the user's account to prevent
 * cases where account dashboard is polluted with stale tokens
 * @param stale
 * @param accessToken
 * @returns
 */
const revokeStaleSession = async (stale: TrelloSession) => {
  const params = new URLSearchParams({
    key: TRELLO_API_KEY,
    token: stale.accessToken,
  });
  try {
    const revokeResult = await fetch(
      `https://api.trello.com/1/tokens/${stale.accessToken}/?${params.toString()}`,
      { method: "DELETE" },
    );

    if (!revokeResult.ok) {
      console.warn("TRELLO: Failed to revoke previous token");
    } else {
      console.log("TRELLO: Successfully revoked previous token");
    }
  } catch (error) {
    console.warn(`TRELLO: Failed to delete stale token ${error}`);
  }
};
