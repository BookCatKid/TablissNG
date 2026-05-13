import { nanoid } from "nanoid";

import { Session } from "../../shared/types/Session";
import { API } from "../../types";

/**
 * Locally saved preferences
 * Stored in local storage with boardID as the key
 */
export type BoardPreference = {
  boardId: string;
  lists: List[];
};

export type TrelloBoardResponse = {
  id: string;
  name: string;
};

export type TrelloListResponse = {
  id: string;
  name: string;
};

export type TrelloCardsResponse = {
  id: string;
  name: string;
  pos: number;
  labels: TrelloListCardLabel[];
};

export type TrelloColour =
  | "green_light"
  | "green_dark"
  | "green"
  | "yellow_light"
  | "yellow_dark"
  | "yellow"
  | "orange_light"
  | "orange_dark"
  | "orange"
  | "red_light"
  | "red_dark"
  | "red"
  | "purple_light"
  | "purple_dark"
  | "purple"
  | "blue_light"
  | "blue_dark"
  | "blue"
  | "sky_light"
  | "sky_dark"
  | "sky"
  | "lime_light"
  | "lime_dark"
  | "lime"
  | "pink_light"
  | "pink_dark"
  | "pink"
  | "black_light"
  | "black_dark"
  | "black";

export const colourPalette: Record<TrelloColour, string> = {
  // Row 1 - light tones
  green_light: "#B8E6D5",
  yellow_light: "#F4E4A6",
  orange_light: "#F4D9A6",
  red_light: "#F4C4C4",
  purple_light: "#E4C4F4",

  // Row 2 - Mid tones
  green: "#4ADE80",
  yellow: "#FCD34D",
  orange: "#FB923C",
  red: "#F87171",
  purple: "#C084FC",

  // Row 3 - dark/Dark tones
  green_dark: "#166534",
  yellow_dark: "#854D0E",
  orange_dark: "#9A3412",
  red_dark: "#991B1B",
  purple_dark: "#6B21A8",

  // Row 4 - light tones (second set)
  blue_light: "#DBEAFE",
  sky_light: "#BAE6FD",
  lime_light: "#D9F99D",
  pink_light: "#FBD5E5",
  black_light: "#D1D5DB",

  // Row 5 - Mid tones (second set)
  blue: "#3B82F6",
  sky: "#0EA5E9",
  lime: "#84CC16",
  pink: "#EC4899",
  black: "#6B7280",

  // Row 6 - dark tones (second set)
  blue_dark: "#1E40AF",
  sky_dark: "#075985",
  lime_dark: "#4D7C0F",
  pink_dark: "#9F1239",
  black_dark: "#374151",
};

export type TrelloListCardLabel = {
  color: TrelloColour;
  name: string;
};

export interface TrelloSession extends Session {
  accessToken: string;
  userId: string;
}

/**
 * Represents the result of fetched trello cards in the plugin's UI
 * Each list fetches their cards independently and indicates fetching using status = LOADING
 *
 * Selected: whether the list should be displayed in the homepage
 */
export type List = {
  id: string;
  name: string;
  cards: Card[];
  status: "COMPLETED" | "LOADING" | "FAILED";
  selected: boolean;
};

export const createList = (listId: string, name: string): List => {
  return {
    id: listId,
    name: name,
    cards: [],
    status: "LOADING",
    selected: false,
  };
};

export type Board = {
  id: string;
  name: string;
};

export type Card = {
  id: string;
  name: string;
  position: number;
  labels: TrelloListCardLabel[];
};

export const createCard = (name: string): Card => {
  return {
    id: nanoid(),
    name,
    position: 0, // in Trello's api 0 indicates at the top of the list
    labels: [],
  };
};

// Store style info on the currently dragged card
export type DragCardStyle = {
  size: { width: number; height: number };
  fontSize: number; // measured in pixels
};

export type Cache = {
  order: string[]; // Array of lists' ids to consistently determine order
  lists: Record<string, List>; // map list ids to their corresponding list
};

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
  lists: {},
};
