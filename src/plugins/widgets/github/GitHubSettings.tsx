import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { DebounceInput } from "../../shared";
import { defaultData, Props } from "./types";

const GitHubSettings: React.FC<Props> = ({ data = defaultData, setData }) => {
  const intl = useIntl();
  return (
    <div className="MessageSettings">
      <label>
        <FormattedMessage
          id="plugins.github.username"
          defaultMessage="GitHub Username"
          description="GitHub Username title"
        />
        <DebounceInput
          type="text"
          value={data.username || ""}
          onChange={(username) => setData({ ...data, username })}
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.showColorLegend}
          onChange={(event) =>
            setData({ ...data, showColorLegend: !data.showColorLegend })
          }
        />{" "}
        <FormattedMessage
          id="plugins.github.showColorLegend"
          defaultMessage="Show color legend"
          description="Option to show color legend"
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.showMonthLabels}
          onChange={(event) =>
            setData({ ...data, showMonthLabels: !data.showMonthLabels })
          }
        />{" "}
        <FormattedMessage
          id="plugins.github.showMonthLabels"
          defaultMessage="Show month labels"
          description="Option to show month labels"
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.showTotalCount}
          onChange={(event) =>
            setData({ ...data, showTotalCount: !data.showTotalCount })
          }
        />{" "}
        <FormattedMessage
          id="plugins.github.showTotalCount"
          defaultMessage="Show total count"
          description="Option to show total count"
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.showTooltips}
          onChange={(event) =>
            setData({ ...data, showTooltips: !data.showTooltips })
          }
        />{" "}
        <FormattedMessage
          id="plugins.github.showTooltips"
          defaultMessage="Show tooltips"
          description="Option to show tooltips on hover"
        />
      </label>

      <label>
        <FormattedMessage
          id="plugins.github.clickAction"
          defaultMessage="Click Action"
          description="Label for click action dropdown"
        />
        <select
          value={data.clickAction}
          onChange={(event) =>
            setData({
              ...data,
              clickAction: event.target.value as "none" | "github" | "profile",
            })
          }
        >
          <option value="none">
            <FormattedMessage
              id="plugins.github.clickAction.none"
              defaultMessage="Do nothing"
              description="Option for no click action"
            />
          </option>
          <option value="github">
            <FormattedMessage
              id="plugins.github.clickAction.github"
              defaultMessage="Go to GitHub.com"
              description="Option to go to GitHub.com"
            />
          </option>
          <option value="profile">
            <FormattedMessage
              id="plugins.github.clickAction.profile"
              defaultMessage="Go to profile page"
              description="Option to go to profile page"
            />
          </option>
        </select>
      </label>
    </div>
  );
};

export default GitHubSettings;
