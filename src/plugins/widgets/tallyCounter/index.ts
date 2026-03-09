import { Config } from "../../types";
import TallyCounter from "./TallyCounter";
import TallyCounterSettings from "./TallyCounterSettings";
import { messages } from "./messages";

const config: Config = {
  key: "widget/tallyCounter",
  name: messages.name,
  description: messages.description,
  dashboardComponent: TallyCounter,
  settingsComponent: TallyCounterSettings,
};

export default config;
