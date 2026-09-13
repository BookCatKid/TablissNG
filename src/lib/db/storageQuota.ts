import type { SyncStorageUsage } from "./storageChunks";

type Listener = () => void;

let current: SyncStorageUsage | null = null;
const listeners = new Set<Listener>();

export const getSyncStorageUsageSnapshot = (): SyncStorageUsage | null =>
  current;

export const subscribeSyncStorageUsage = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const publishSyncStorageUsage = (usage: SyncStorageUsage): void => {
  current = usage;
  listeners.forEach((listener) => listener());
};
