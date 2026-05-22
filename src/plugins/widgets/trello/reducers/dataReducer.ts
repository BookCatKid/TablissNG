import { BoardPreference, Data, List } from "../types";

export type DataReducerAction =
  | { type: "SET_SELECTED_BOARD"; boardId: string }
  | { type: "ADD_PREFERENCE"; boardId: string; lists: List[] };

export function dataReducer(data: Data, action: DataReducerAction) {
  switch (action.type) {
    case "SET_SELECTED_BOARD": {
      return {
        ...data,
        selectedID: action.boardId,
      };
    }
    case "ADD_PREFERENCE": {
      const newPreference: BoardPreference = {
        boardId: action.boardId,
        lists: action.lists,
      };

      return {
        ...data,
        preferences: {
          ...data.preferences,
          [action.boardId]: newPreference,
        },
      };
    }
    default:
      return data;
  }
}
