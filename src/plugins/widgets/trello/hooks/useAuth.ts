import { useState, useEffect } from "react";
import { checkAuth, runAuthFlow,  } from "../utils/auth";
import { AuthState, Cache } from "../types";

/**
 * Hook for reading and setting authentication state. Bundles a client functions for signing in and out
 * @param cache 
 * @param setCache  cache setter used for updating global authentication state since we can't use context providers
 * @returns 
 */
export default function useAuth(cache: Cache, setCache: (cache: Cache) => void) {
    const authState = cache.authState ?? "unauthenticated";
    const [authError, setAuthError] = useState<string | null>(null);
   
    // check authentication status on load and on any changes to cache
    useEffect(() => {
        const effect = async () => {
            try {
                const auth = await checkAuth();
                await setAuthState(auth ? "authenticated" : "unauthenticated");
            } catch (err) {
                setAuthError("Failed to check authentication status");
                setAuthState("unauthenticated");
            }
        }

        // prevent cases where signing triggers the hook to sign the user back in
        // if the useris attempting to sign out stop the hook
        if (authState !== "pending") {
            effect();
        }
    }, []);

    const signIn = async () => {
        console.log("Authenticating");
        setAuthState("pending");
        try {
            await runAuthFlow();
            await setAuthState("authenticated");
        } catch (err) {
            setAuthError("Failed to authenticate user");
            await setAuthState("unauthenticated");
        }
    }

    const setAuthState = (state: AuthState) => {
        setCache({ ...cache, authState: state });
    }

    const signOut = async () => {
        // clear session token 
        setAuthState("pending");
        await browser.storage.local.clear();
    }

    return {authState, authError, signIn, signOut};
}