import { Action } from "./actions";
import { Link } from "./types";

type State = Link[];

export function reducer(state: State, action: Action) {
  switch (action.type) {
    case "ADD_LINK":
      return state.concat({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        url: "https://",
      });

    case "REMOVE_LINK":
      return state.filter((_, index) => index !== action.data.index);

    case "UPDATE_LINK":
      return state.map((link, index) =>
        index === action.data.index ? action.data.link : link,
      );

    case "REORDER_LINK": {
      const { index, to } = action.data;
      if (index < 0 || index >= state.length || to < 0 || to >= state.length) {
        return state;
      }
      const links = [...state];
      links.splice(to, 0, links.splice(index, 1)[0]);
      return links;
    }

    case "IMPORT_LINKS":
      return state.concat(action.data.links);

    default:
      throw new Error("Unknown action");
  }
}
