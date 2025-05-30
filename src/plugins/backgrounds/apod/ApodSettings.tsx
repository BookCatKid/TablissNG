import React from "react";
import { FormattedMessage } from "react-intl";
import "./ApodSettings.sass";
import { DebounceInput } from "../../shared";
import { ApodDate, defaultData, Props } from "./types";
import { format } from "date-fns";

const maxDate = format(new Date(), "yyyy-MM-dd");

const ApodSettings: React.FC<Props> = ({ data = defaultData, setData }) => (
  <div className="ApodSettings">
    <label>
      <FormattedMessage
        id="backgrounds.apod.dateOfPicture"
        defaultMessage="Date of the picture"
        description="Label for date selection dropdown"
      />
      <select
        value={data.date}
        onChange={(event) =>
          setData({ ...data, date: event.target.value as ApodDate })
        }
      >
        <option value="today">
          <FormattedMessage
            id="backgrounds.apod.today"
            defaultMessage="Today"
            description="Option for today's picture"
          />
        </option>
        <option value="custom">
          <FormattedMessage
            id="backgrounds.apod.customDate"
            defaultMessage="Custom date"
            description="Option for custom date selection"
          />
        </option>
      </select>
    </label>

    {data.date === "custom" && (
      <label>
        <FormattedMessage
          id="backgrounds.apod.date"
          defaultMessage="Date"
          description="Label for date input"
        />
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
      <FormattedMessage
        id="backgrounds.apod.showTitle"
        defaultMessage="Show title"
        description="Label for show title checkbox"
      />
    </label>
  </div>
);

export default ApodSettings;
