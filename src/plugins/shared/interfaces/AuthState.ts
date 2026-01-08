export interface AuthState {
  status: "authenticated" | "pending" | "unauthenticated";
  setStatus: (updated: "authenticated" | "pending" | "unauthenticated") => void;
}
