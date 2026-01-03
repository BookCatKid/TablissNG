import { Session } from "../types";

/**
 * Creates authentication popup then calls callback endpoint to generate JWT
 * Stores JWT in extension local storage
 */
export const runAuthFlow = async () => {
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

    const expiry = Date.now() + 60 * 60 * 24 * 1000;
    // get user id
    const self = await fetch(`https://api.trello.com/1/members/me?key=${TRELLO_API_KEY}&token=${token}`)
    if (!self.ok) {
      return;  
    }

    const userData = await self.json();
    const id = userData["id"];
    await browser.storage.local.set({ session: { userId: id, accessToken: token, expires: expiry } });
}

/**
 * Checks if the user is authenticated by inspecting token expiry 
 * @returns 
 */
export const checkAuth = async () => {
    try {
        const token = await getSession();
        console.log("TOKEN ", token);
        if (!token) {
            return false;
        }
        const expiry = token.expires;
        console.log(expiry);
        console.log(Date.now());
        return expiry > Date.now();
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export const getSession = async () => {
    const obj = await browser.storage.local.get("trelloSession");
    console.log(obj);
    const token: Session | null = typeof obj["trelloSession"] === "object" ? obj["trelloSession"] as Session : null;
    if (!token) return null;
    console.log(token);
    return token;
}
