import { nanoid as generateId } from "nanoid";

import { Pair } from "./types";

export function addPair() {
  return {
    type: "ADD_PAIR",
    data: {
      id: generateId(),
      from: "bitcoin",
      to: "usd",
      showChange: true,
    },
  } as const;
}

export function removePair(id: string) {
  return {
    type: "REMOVE_PAIR",
    data: { id },
  } as const;
}

export function updatePair(id: string, changes: Omit<Partial<Pair>, "id">) {
  return {
    type: "UPDATE_PAIR",
    data: { id, changes },
  } as const;
}

export function reorderPair(index: number, to: number) {
  return {
    type: "REORDER_PAIR",
    data: { index, to },
  } as const;
}

export type Action =
  | ReturnType<typeof addPair>
  | ReturnType<typeof removePair>
  | ReturnType<typeof updatePair>
  | ReturnType<typeof reorderPair>;
