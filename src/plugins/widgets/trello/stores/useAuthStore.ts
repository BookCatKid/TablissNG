import { create } from "zustand";

interface AuthState {
    status: "authenticated" | "pending" | "unauthenticated"; 
    setStatus: (updated: "authenticated" | "pending" | "unauthenticated") => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
    status: "unauthenticated",
    setStatus: (updated: "authenticated" | "pending" | "unauthenticated") => set({ status: updated }),
}));