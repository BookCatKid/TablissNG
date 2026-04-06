import { backgroundConfigs } from "./backgrounds";
import { widgetConfigs } from "./widgets";
export { backgroundConfigs } from "./backgrounds";
export { widgetConfigs } from "./widgets";
import { config as unknownConfig } from "./widgets/unknown";

const configs = [...backgroundConfigs, ...widgetConfigs, unknownConfig];

export function getConfig(key: string) {
  const config = configs.find((config) => config.key === key);

  if (!config) {
    console.warn(`Unable to find config for plugin: ${key}`);
    return unknownConfig;
  }

  return config;
}
