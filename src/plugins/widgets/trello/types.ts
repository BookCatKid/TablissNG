import { API } from "../../types";

/**
 * Locally saved preferences
 * Stored in local storage with boardID as the key 
 */
export type BoardPreferences = {
  selectedLists: List[];
}

/**
 * Type to represent UI lists on the browser page
 */
export type DisplayList = {
  id: string; // same list id
  name: string;
  items: DisplayListItem[];
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

export type Data = {
  selectedID: string | null; // selected board ID
  selectedLists: List[]; // lists to display in the UI
  authState: "authenticated" | "pending" | "unauthenticated"
};

export type Props = API<Data>;

export const defaultData: Data = {
  selectedID: null,
  selectedLists: [],
  authState: "unauthenticated"
};
