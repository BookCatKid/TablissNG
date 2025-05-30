import React from "react";
import { FormattedMessage } from "react-intl";
import "./WikimediaSettings.sass";
import { DebounceInput } from "../../shared";
import { WikimediaDate, defaultData, Props } from "./types";

const WikimediaSettings: React.FC<Props> = ({ data = defaultData, setData }) => (
  <div className="ApodSettings">
    <label>
      <FormattedMessage
        id="backgrounds.wikimedia.date"
        defaultMessage="Date of the picture"
      />
      <select
        value={data.date}
        onChange={(event) =>
          setData({ ...data, date: event.target.value as WikimediaDate })
        }
      >
        <option value="today">
          <FormattedMessage
            id="backgrounds.wikimedia.today"
            defaultMessage="Today"
          />
        </option>
        <option value="custom">
          <FormattedMessage
            id="backgrounds.wikimedia.customDate"
            defaultMessage="Custom date"
          />
        </option>
      </select>
    </label>

    {data.date === "custom" && (
      <label>
        <FormattedMessage
          id="backgrounds.wikimedia.dateLabel"
          defaultMessage="Date"
        />
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
        onChange={(event) => setData({ ...data, showTitle: !data.showTitle })}
      />{" "}
      <FormattedMessage
        id="backgrounds.wikimedia.showTitle"
        defaultMessage="Show title"
      />
    </label>
  </div>
);

export default WikimediaSettings;
