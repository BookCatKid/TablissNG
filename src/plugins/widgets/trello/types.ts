import { API } from "../../types";

export type AuthState = "authenticated" | "pending" | "unauthenticated";

/**
 * Locally saved preferences
 * Stored in local storage with boardID as the key 
 */
export type BoardPreference = {
  boardId: string;
  lists: List[];
}

/**
 * Type to represent UI lists on the browser page
 */
export type DisplayList = {
  id: string; // same list id
  name: string;
  items: DisplayListItem[];
  loading: boolean;
}

/**
 * Represents a pending job to fetch items from a trello board
 */
export type TrelloItemsResponse = {
  listId: string;
  items: TrelloListItem[];
  loading: boolean;
}

export const createTrelloItemsResponse = (listId: string) => {
  return {
    listId: listId,
    items: [],
    loading: true
  }  as TrelloItemsResponse
}

export type TrelloListItem = {
  id: string;
  name: string;
  // add more attributes from api as fit
}

export type DisplayListItem = {
  content: string;
}

export type Board = {
  id: string;
  name: string;
}

export type List = {
  id: string;
  name: string;
  watch: boolean;
}

export type Item = {
  id: string;
  name: string;
}

export type Cache = {
  order: List[]; // order of responses for rendering
  responses: Map<string, TrelloItemsResponse>; // map list ids to the corresponding API response
  authState: AuthState;
}

export type Data = {
  selectedID: string | null; // selected board ID
  preferences: Record<string, BoardPreference>;
};

export type Props = API<Data, Cache>;

export const defaultData: Data = {
  selectedID: null,
  preferences: {},
};

export const defaultCache: Cache = {
  order: [],
  responses: new Map<string, TrelloItemsResponse>(),
  authState: "unauthenticated",
}