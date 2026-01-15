import React from "react";
import { FormattedMessage } from "react-intl";
import { DebounceInput } from "../../shared";
import { Data, defaultData, Props } from "./types";
import { format } from "date-fns";
import { backgroundMessages } from "../../../locales/messages";
import "./Bing.sass";

const getMaxDate = () => format(new Date(), "yyyy-MM-dd");

const locales = [
  "US/en",
  "CA/en",
  "IT/it",
  "ES/es",
  "FR/fr",
  "DE/de",
  "GB/en",
  "CA/fr",
  "IN/en",
  "CN/zh",
  "JP/ja",
  "BR/pt",
  "ROW/en",
];

const BingSettings: React.FC<Props> = ({ data = defaultData, setData }) => (
  <div className="BingSettings">
    <label>
      <FormattedMessage {...backgroundMessages.dateOfPicture} />
      <select
        value={data.date}
        onChange={(event) =>
          setData({ ...data, date: event.target.value as Data["date"] })
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
          min="2009-06-03"
          max={getMaxDate()}
          className="date"
          onChange={(value) => setData({ ...data, customDate: value })}
          wait={500}
        />
      </label>
    )}

    <label>
      <FormattedMessage {...backgroundMessages.locale} />
      <select
        value={data.locale}
        onChange={(event) => setData({ ...data, locale: event.target.value })}
      >
        {locales.map((l) => (
          <option value={l} key={l}>
            {l}
          </option>
        ))}
      </select>
    </label>

    <label>
      <input
        type="checkbox"
        checked={data.showTitle}
        onChange={(event) => setData({ ...data, showTitle: !data.showTitle })}
      />
      <FormattedMessage {...backgroundMessages.showTitle} />
    </label>
  </div>
);

export default BingSettings;
