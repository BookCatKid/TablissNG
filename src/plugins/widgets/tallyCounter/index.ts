import { Config } from "../../types";
import { messages } from "./messages";
import TallyCounter from "./TallyCounter";
import TallyCounterSettings from "./TallyCounterSettings";

const config: Config = {
  key: "widget/tallyCounter",
  name: messages.name,
  description: messages.description,
  dashboardComponent: TallyCounter,
  settingsComponent: TallyCounterSettings,
};

export default config;
