import { create } from "zustand";
import { AuthState } from "../../../shared/interfaces/AuthState";

export const useTrelloAuthStore = create<AuthState>()((set) => ({
  status: "unauthenticated",
  setStatus: (updated: "authenticated" | "pending" | "unauthenticated") =>
    set({ status: updated }),
}));
