import { BoardPreference, Data, SettingsListOption } from "./types";

type DataReducerAction =
  | { type: "SET_SELECTED_BOARD"; boardId: string }
  | { type: "ADD_PREFERENCE"; boardId: string; lists: SettingsListOption[] };

export function dataReducer(data: Data, action: DataReducerAction) {
  switch (action.type) {
    case "ADD_PREFERENCE": {
      const newPreference: BoardPreference = {
        boardId: action.boardId,
        lists: action.lists,
      };

      const updated = {
        ...data.preferences,
        [action.boardId]: newPreference,
      };

      return {
        ...data,
        preferences: updated,
      };
    }
    default:
      return data;
  }
}
