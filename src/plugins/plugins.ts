import { backgroundConfigs } from "./backgrounds";
import { widgetConfigs } from "./widgets";
export { backgroundConfigs } from "./backgrounds";
export { widgetConfigs } from "./widgets";
import Unknown from "./widgets/unknown/Unknown";
import UnknownSettings from "./widgets/unknown/UnknownSettings";
import { messages as unknownMessages } from "./widgets/unknown";

const configs = [...backgroundConfigs, ...widgetConfigs];

export function getConfig(key: string) {
  const config = configs.find((config) => config.key === key);

  if (!config) {
    console.warn(`Unable to find config for plugin: ${key}`);
    return {
      key: "widget/unknown",
      name: unknownMessages.name,
      description: unknownMessages.description,
      dashboardComponent: Unknown,
      settingsComponent: UnknownSettings,
      supportsBackdrop: false,
    };
  }

  return config;
}
