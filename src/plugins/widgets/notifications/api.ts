import { pkceLogin } from "../../../utils";
import { InboxItem, SEApiResponse, WikiApiResponse } from "./types";

// you can use my client ids (they will work on chrome)
const SE_CLIENT_ID = "36170";
const WIKI_CLIENT_ID = "8c1201270efed1a1cc62c8569bc3302a";

export const fetchSETokens = async () => {
  // Docs:
  // https://api.stackexchange.com/docs/authentication
  // https://stackapps.com/help/api-authentication
  const { access_token } = await pkceLogin({
    authUrl: "https://stackoverflow.com/oauth",
    tokenEndpoint: "https://stackoverflow.com/oauth/access_token/json",
    clientId: SE_CLIENT_ID,
    scope: "read_inbox no_expiry",
  });

  return { access_token };
};

export const fetchWikiTokens = async () => {
  // Docs: https://api.wikimedia.org/wiki/Authentication#User_authentication
  const { access_token } = await pkceLogin({
    authUrl: "https://meta.wikimedia.org/w/rest.php/oauth2/authorize",
    tokenEndpoint: "https://meta.wikimedia.org/w/rest.php/oauth2/access_token",
    clientId: WIKI_CLIENT_ID,
    grant_type: "authorization_code",
  });

  return { access_token };
};

export const fetchSEInbox = async (accessToken: string) => {
  // Docs:
  // https://api.stackexchange.com/docs/types/inbox-item
  // https://meta.stackexchange.com/questions/417382

  const res = await fetch("https://api.stackexchange.com/2.3/inbox/unread", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json: SEApiResponse = await res.json();

  if (!res.ok) {
    console.error(json);
    return null;
  }

  const items: InboxItem[] = [];

  for (const { link, title, creation_date } of json.items) {
    items.push({ link, msg: title, time: creation_date });
  }

  return items;
};

export const fetchWikiInbox = async (accessToken: string) => {
  // Docs: https://www.mediawiki.org/wiki/Notifications/API

  const params = new URLSearchParams({
    action: "query",
    meta: "notifications",
    notprop: "list",
    notfilter: "!read",
    format: "json",
    crossorigin: "",
  });

  const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json: WikiApiResponse = await res.json();

  if (!res.ok) {
    console.error(json);
    return null;
  }

  const items: InboxItem[] = [];

  for (const { revid, title, type, timestamp } of json.query.notifications
    .list) {
    items.push({
      link: revid
        ? `https://en.wikipedia.org/w/index.php?oldid=prev&diff=${revid}`
        : `https://en.wikipedia.org/wiki/${title.full}`,
      msg: `${type}: ${title.full}`,
      time: timestamp.utcunix,
    });
  }
  return items;
};

export const dummyTokens = async () => {
  console.log("dummy login");
  return { access_token: null };
};

export const dummyInbox = async (token: string) => {
  return null;
};
