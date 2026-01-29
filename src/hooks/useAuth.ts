import { useState, useEffect } from "react";
import { Session } from "../plugins/shared/types/Session";
import { StoreApi, UseBoundStore } from "zustand";
import { AuthState } from "../plugins/shared/interfaces/AuthState";

// Typedef for a Zustand store type definition
type Store<T> = UseBoundStore<StoreApi<T>>;

/**
 * Hook for reading and setting authentication state in widgets. Encapsulates client functions for signing in and out
 * Requires a zustand store to maintain authentication state for different widgets
 * Takes a generic parameter defining the shape of a session
 *
 * @param sessionName identifies the token in local storage
 * @param store
 * @returns
 */
export default function useAuth<T extends Session>(
  sessionName: string,
  store: Store<AuthState>,
) {
  const { status: authStatus, setStatus: setAuthStatus } = store();
  const [authError, setAuthError] = useState<string | null>("");

  const getSession = async (): Promise<T | null> => {
    const obj = await browser.storage.local.get(sessionName);
    return typeof obj[sessionName] === "object"
      ? (obj[sessionName] as T)
      : null;
  };

  /**
   * Checks if the user is authenticated by inspecting token expiry
   * @returns
   */
  const checkAuth = async () => {
    try {
      const token = await getSession();
      if (!token) {
        return false;
      }
      return token.expires > Date.now();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // check authentication status on load
  useEffect(() => {
    const effect = async () => {
      try {
        const auth = await checkAuth();
        setAuthStatus(auth ? "authenticated" : "unauthenticated");
      } catch (err) {
        console.error("TRELLO AUTH CHECK ERROR: ", err);
        setAuthError("Failed to check authentication status");
        setAuthStatus("unauthenticated");
      }
    };

    // prevent cases where signing in triggers the hook to sign the user back in
    // if the user is attempting to sign out stop the hook
    if (authStatus !== "pending") {
      effect();
    }
  }, []);

  /**
   * Attempts to authenticate user via an authentication method
   * Saves resulting session in local storage and adjusts state
   * @param authFlow
   */
  const signIn = async (authFlow: () => Promise<T | null>) => {
    console.log("Authenticating");
    setAuthStatus("pending");
    try {
      const session: T | null = await authFlow();
      if (!session) {
        throw Error("Failed to authenticate");
      }
      await browser.storage.local.set({ [sessionName]: { ...session } });
      setAuthStatus("authenticated");
    } catch (err) {
      console.error("TRELLO SIGN IN ERROR: ", err);
      setAuthError("Failed to authenticate user");
      setAuthStatus("unauthenticated");
    }
  };

  /**
   * Clears session token and runs optional callback onSignOut for side effects
   * @param onSignOut
   */
  const signOut = async (onSignOut?: (session: T) => Promise<void>) => {
    console.log("TRELLO: Signing out goodbye :)");
    setAuthStatus("pending");
    setAuthError("");
    const session = await getSession();
    await browser.storage.local.remove(sessionName);
    try {
      if (onSignOut && session) {
        await onSignOut(session);
      }
    } catch (error) {
      console.error("TRELLO: Failed to run onSignOut");
    } finally {
      setAuthStatus("unauthenticated");
    }
  };

  return { authStatus, authError, getSession, signIn, signOut };
}
