// import nba from "./nba";  TODO: FIX (IT'S BROKEN)
// import randomMessage from "./randomMessage"; removed, use customText
import binarytime from "./binaryTime";
import bitcoin from "./bitcoin";
import bookmarks from "./bookmarks";
import countdown from "./countdown";
import css from "./css";
import customText from "./customText";
import github from "./github";
import greeting from "./greeting";
import html from "./html";
import ipInfo from "./ipInfo";
import joke from "./joke";
import js from "./js";
import links from "./links";
import literatureClock from "./literatureClock";
import message from "./message";
import notes from "./notes";
import quote from "./quote";
import search from "./search";
import since from "./since";
import time from "./time";
import todo from "./todo";
import topSites from "./topSites";
import weather from "./weather";
import workHours from "./workHours";
import timeTracker from "./timeTracker";
import trello from "./trello";

export const widgetConfigs = [
  // nba,
  binarytime,
  bitcoin,
  countdown,
  css,
  customText,
  github,
  greeting,
  html,
  ipInfo,
  joke,
  links,
  literatureClock,
  message,
  notes,
  quote,
  search,
  since,
  time,
  todo,
  weather,
  workHours,
  timeTracker,
];

if (BUILD_TARGET === "web") {
  widgetConfigs.push(js);
}
if (BUILD_TARGET != "web" && BUILD_TARGET != "safari") {
  widgetConfigs.push(topSites);
  widgetConfigs.push(bookmarks);
  widgetConfigs.push(trello);
}
