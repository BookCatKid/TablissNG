import { useState, useEffect } from "react";
import { checkAuth, runAuthFlow,  } from "../utils/auth";
import { useAuthStore } from "../stores/useAuthStore";

/**
 * Hook for reading and setting authentication state. Bundles a client functions for signing in and out
 * @param cache 
 * @param setCache  cache setter used for updating global authentication state since we can't use context providers
 * @returns 
 */
export default function useAuth() {
    const authStatus = useAuthStore((state) => state.status); 
    const setAuthStatus = useAuthStore((state) => state.setStatus);
    const [authError, setAuthError] = useState<string | null>("");

    // check authentication status on load and on any changes to cache
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
        }

        // prevent cases where signing in triggers the hook to sign the user back in
        // if the user is attempting to sign out stop the hook
        if (authStatus !== "pending") {
            effect();
        }
    }, []);

    const signIn = async () => {
        console.log("Authenticating");
        setAuthStatus("pending");
        try {
            await runAuthFlow();
            setAuthStatus("authenticated");
        } catch (err) {
            console.error("TRELLO SIGN IN ERROR: ", err);
            setAuthError("Failed to authenticate user");
            setAuthStatus("unauthenticated");
        }
    }
    
    const signOut = async () => {
        console.log("TRELLO: Signing out goodbye :)");
        setAuthStatus("pending");
        // clear session token 
        await browser.storage.local.clear();
        setAuthStatus("unauthenticated");
    }

    return { authStatus, authError, signIn, signOut };
}