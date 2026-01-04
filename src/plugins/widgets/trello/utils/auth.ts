import { TrelloSession } from "../types";

/**
 * Creates authentication popup then creates and returns session object
 */
export const trelloAuthFlow = async (): Promise<TrelloSession | null> => {
    const AUTH_URL_BASE = "https://trello.com/1/authorize" +
        "?expiration=30days" +
        "&callback_method=fragment" +
        "&scope=read" +
        "&response_type=token" +
        `&key=${TRELLO_API_KEY}`    

    const redirectUrl = browser.identity.getRedirectURL();
    const AUTH_URL = `${AUTH_URL_BASE}&return_url=${encodeURIComponent(redirectUrl)}`;
    const redirectResponse = await browser.identity.launchWebAuthFlow({
      url: AUTH_URL,
      interactive: true
    });

    // receive token granted by Trello
    const tokenMatch = redirectResponse.match(/token=([^&]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      return null;
    }

    const expiry = Date.now() + 60 * 60 * 24 * 30 * 1000;

    // get user id
    const self = await fetch(`https://api.trello.com/1/members/me?key=${TRELLO_API_KEY}&token=${token}`)
    if (!self.ok) {
      return null;  
    }

    const userData = await self.json();
    const id = userData["id"];
    return {
      userId: id,
      name: "trello",
      accessToken: token,
      expires: expiry,
    } as TrelloSession;
}