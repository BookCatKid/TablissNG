import { Config } from "../../types";
import { messages } from "./messages";
import TallyCounter from "./TallyCounter";
import TallyCounterSettings from "./TallyCounterSettings";
import { defaultData } from "./types";

const config: Config = {
  key: "widget/tallyCounter",
  name: messages.name,
  description: messages.description,
  dashboardComponent: TallyCounter,
  settingsComponent: TallyCounterSettings,
  defaultData,
};

export default config;
