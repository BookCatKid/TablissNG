import "./WikimediaSettings.sass";

import type { FC } from "react";
import { FormattedMessage } from "react-intl";

import { backgroundMessages } from "../../../locales/messages";
import { DebounceInput } from "../../shared";
import { defaultData, Props, WikimediaDate } from "./types";

const WikimediaSettings: FC<Props> = ({ data = defaultData, setData }) => (
  <div className="WikimediaSettings">
    <label>
      <FormattedMessage {...backgroundMessages.dateOfPicture} />
      <select
        value={data.date}
        onChange={(event) =>
          setData({ ...data, date: event.target.value as WikimediaDate })
        }
      >
        <option value="today">
          <FormattedMessage {...backgroundMessages.today} />
        </option>
        <option value="custom">
          <FormattedMessage {...backgroundMessages.customDate} />
        </option>
      </select>
    </label>

    {data.date === "custom" && (
      <label>
        <FormattedMessage {...backgroundMessages.date} />
        <DebounceInput
          type="date"
          value={data.customDate}
          min="2005-01-01"
          className="date"
          onChange={(value) => setData({ ...data, customDate: value })}
          wait={500}
        />
      </label>
    )}

    <label>
      <input
        type="checkbox"
        checked={data.showTitle}
        onChange={(event) =>
          setData({ ...data, showTitle: event.target.checked })
        }
      />{" "}
      <FormattedMessage {...backgroundMessages.showTitle} />
    </label>
  </div>
);

export default WikimediaSettings;
