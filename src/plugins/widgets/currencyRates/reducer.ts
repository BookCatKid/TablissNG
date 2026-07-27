import { Action } from "./actions";
import { Pair } from "./types";

type State = Pair[];

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_PAIR":
      return state.concat(action.data);

    case "REMOVE_PAIR":
      return state.filter((pair) => pair.id !== action.data.id);

    case "UPDATE_PAIR":
      return state.map((pair) =>
        pair.id === action.data.id ? { ...pair, ...action.data.changes } : pair,
      );

    case "REORDER_PAIR": {
      const { index, to } = action.data;
      if (index < 0 || index >= state.length || to < 0 || to >= state.length) {
        return state;
      }
      const pairs = [...state];
      pairs.splice(to, 0, pairs.splice(index, 1)[0]);
      return pairs;
    }

    default:
      throw new Error("Unknown action");
  }
}
