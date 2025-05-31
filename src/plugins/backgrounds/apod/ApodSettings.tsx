import React from "react";
import { FormattedMessage } from "react-intl";
import "./ApodSettings.sass";
import { DebounceInput } from "../../shared";
import { ApodDate, defaultData, Props } from "./types";
import { format } from "date-fns";
import { backgroundMessages } from "../../../locales/messages";

const maxDate = format(new Date(), "yyyy-MM-dd");

const ApodSettings: React.FC<Props> = ({ data = defaultData, setData }) => (
  <div className="ApodSettings">
    <label>
      <FormattedMessage {...backgroundMessages.dateOfPicture} />
      <select
        value={data.date}
        onChange={(event) =>
          setData({ ...data, date: event.target.value as ApodDate })
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
          min="1995-06-16"
          max={maxDate}
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
        onChange={(event) => setData({ ...data, showTitle: !data.showTitle })}
      />{" "}
      <FormattedMessage {...backgroundMessages.showTitle} />
    </label>
  </div>
);

export default ApodSettings;
