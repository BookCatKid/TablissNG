import { FormattedMessage } from "react-intl";

import { DebounceInput } from "../../shared";
import { defaultData, Props } from "./types";

const LeetcodeSettings = ({ data = defaultData, setData }: Props) => {
  return (
    <div className="LeetcodeSettings">
      <label>
        <FormattedMessage
          id="plugins.leetcode.username"
          defaultMessage="Leetcode Username"
          description="Leetcode Username title"
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
            setData({ ...data, showColorLegend: event.target.checked })
          }
        />{" "}
        <FormattedMessage
          id="plugins.leetcode.showColorLegend"
          defaultMessage="Show color legend"
          description="Option to show color legend"
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.showMonthLabels}
          onChange={(event) =>
            setData({ ...data, showMonthLabels: event.target.checked })
          }
        />{" "}
        <FormattedMessage
          id="plugins.leetcode.showMonthLabels"
          defaultMessage="Show month labels"
          description="Option to show month labels"
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.showTotalCount}
          onChange={(event) =>
            setData({ ...data, showTotalCount: event.target.checked })
          }
        />{" "}
        <FormattedMessage
          id="plugins.leetcode.showTotalCount"
          defaultMessage="Show total count"
          description="Option to show total count"
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.showTooltips}
          onChange={(event) =>
            setData({ ...data, showTooltips: event.target.checked })
          }
        />{" "}
        <FormattedMessage
          id="plugins.leetcode.showTooltips"
          defaultMessage="Show tooltips"
          description="Option to show tooltips on hover"
        />
      </label>

      <label>
        <FormattedMessage
          id="plugins.leetcode.clickAction"
          defaultMessage="Click Action"
          description="Label for click action dropdown"
        />
        <select
          value={data.clickAction}
          onChange={(event) =>
            setData({
              ...data,
              clickAction: event.target.value as "none" | "potd" | "profile",
            })
          }
        >
          <option value="none">
            <FormattedMessage
              id="plugins.leetcode.clickAction.none"
              defaultMessage="Do nothing"
              description="Option for no click action"
            />
          </option>
          <option value="potd">
            <FormattedMessage
              id="plugins.leetcode.clickAction.potd"
              defaultMessage="Go to POTD"
              description="Option to go to POTD"
            />
          </option>
          <option value="profile">
            <FormattedMessage
              id="plugins.leetcode.clickAction.profile"
              defaultMessage="Go to profile page"
              description="Option to go to profile page"
            />
          </option>
        </select>
      </label>
    </div>
  );
};

export default LeetcodeSettings;
