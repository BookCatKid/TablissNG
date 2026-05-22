import "./Leetcode.sass";

import { ActivityCalendar } from "react-activity-calendar";

import { useTheme } from "../../../hooks";
import { useCalendar, useMessages } from "./hooks";
import { defaultData, Props } from "./types";

const theme = {
  light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
  dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
};

const LeetcodeCalendarWidget = ({ data = defaultData }: Props) => {
  const { labels, tooltip } = useMessages();
  const { calendar } = useCalendar(data.username);

  const { isDark } = useTheme();
  const colorScheme = isDark ? "dark" : "light";

  const hrefMap = {
    potd: "https://leetcodepotd.vercel.app",
    profile: `https://leetcode.com/u/${data.username}`,
    none: undefined,
  };

  return (
    <>
      {calendar && (
        <a
          className="Leetcode"
          href={hrefMap[data.clickAction]}
          rel="noopener noreferrer"
          style={{
            cursor: data.clickAction === "none" ? "default" : "pointer",
            textDecoration: "none",
          }}
        >
          <ActivityCalendar
            showColorLegend={data.showColorLegend}
            showMonthLabels={data.showMonthLabels}
            showTotalCount={data.showTotalCount}
            data={calendar}
            colorScheme={colorScheme}
            labels={labels}
            theme={theme}
            tooltips={
              data.showTooltips
                ? {
                    activity: {
                      text: tooltip,
                    },
                  }
                : undefined
            }
          />
        </a>
      )}
    </>
  );
};

export default LeetcodeCalendarWidget;
