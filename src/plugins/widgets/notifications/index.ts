import { defineMessages } from "react-intl";
import { Config } from "../../types";
import Notif from "./Notifications";
import NotifSettings from "./Settings";

const messages = defineMessages({
  name: {
    id: "plugins.notification.name",
    defaultMessage: "Notification",
    description: "Name of the Notification widget",
  },
  description: {
    id: "plugins.notification.description",
    defaultMessage: "See all your notifications in one place",
    description: "Description of the Notification widget",
  },
});

const config: Config = {
  key: "widget/notification",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Notif,
  settingsComponent: NotifSettings,
};

export default config;
