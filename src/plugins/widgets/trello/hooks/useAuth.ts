import { useState, useEffect } from "react";
import { checkAuth, runAuthFlow } from "../utils/auth";
import { AuthState } from "../types";

export default function useAuth() {
    const [authState, setAuthState] = useState<AuthState>("unauthenticated");
    const [authError, setAuthError] = useState<string | null>(null);
   
    // check authentication status on load
    useEffect(() => {
        const effect = async () => {
            try {
                const auth = await checkAuth();
                setAuthState(auth ? "authenticated" : "unauthenticated");
            } catch (err) {
                setAuthError("Failed to check authentication status");
                setAuthState("unauthenticated");
            }
        }
        effect();
    }, []);

    const authenticate = async () => {
        console.log("Authenticating");
        setAuthState("pending");
        try {
            await runAuthFlow();
            setAuthState("authenticated");
        } catch (err) {
            setAuthError("Failed to authenticate user");
            setAuthState("unauthenticated");
        }
    }

    const signOut = async () => {
        // clear session token and preferences
        await browser.storage.local.clear();
        setAuthState("unauthenticated");
    }

    return {authState, authError, authenticate, signOut};
}