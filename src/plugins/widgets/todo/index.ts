import { defineMessages } from "react-intl";

import { Config } from "../../types";
import Todo from "./Todo";
import TodoSettings from "./TodoSettings";

const messages = defineMessages({
  name: {
    id: "plugins.todo.name",
    defaultMessage: "Todos",
    description: "Name of the Todo widget",
  },
  description: {
    id: "plugins.todo.description",
    defaultMessage: "Add reminders to procrastinate.",
    description: "Description of the Todo widget",
  },
});

const config: Config = {
  key: "widget/todo",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Todo,
  settingsComponent: TodoSettings,
};

export default config;
