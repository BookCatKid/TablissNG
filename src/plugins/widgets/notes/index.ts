import { defineMessages } from "react-intl";

import { Config } from "../../types";
import Notes from "./Notes";
import NotesSettings from "./NotesSettings";

const messages = defineMessages({
  name: {
    id: "plugins.notes.name",
    defaultMessage: "Notes",
    description: "Name of the Notes widget",
  },
  description: {
    id: "plugins.notes.description",
    defaultMessage: "Keep track of your thoughts and ideas.",
    description: "Description of the Notes widget",
  },
});

const config: Config = {
  key: "widget/notes",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Notes,
  settingsComponent: NotesSettings,
};

export default config;
