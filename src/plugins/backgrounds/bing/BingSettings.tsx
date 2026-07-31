import "./Bing.sass";

import { format } from "date-fns";
import { type FC } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";

import { backgroundMessages } from "../../../locales/messages";
import { DebounceInput } from "../../shared";
import { Data, defaultData, Props } from "./types";

const getMaxDate = () => format(new Date(), "yyyy-MM-dd");

const regionMessages = defineMessages({
  row: {
    id: "backgrounds.bing.region.row",
    defaultMessage: "Rest of World (ROW/en)",
    description: "Rest of World region option for Bing wallpaper",
  },
  us: {
    id: "backgrounds.bing.region.us",
    defaultMessage: "United States (US/en)",
    description: "United States region option for Bing wallpaper",
  },
  gb: {
    id: "backgrounds.bing.region.gb",
    defaultMessage: "United Kingdom (GB/en)",
    description: "United Kingdom region option for Bing wallpaper",
  },
  de: {
    id: "backgrounds.bing.region.de",
    defaultMessage: "Germany (DE/de)",
    description: "Germany region option for Bing wallpaper",
  },
  fr: {
    id: "backgrounds.bing.region.fr",
    defaultMessage: "France (FR/fr)",
    description: "France region option for Bing wallpaper",
  },
  it: {
    id: "backgrounds.bing.region.it",
    defaultMessage: "Italy (IT/it)",
    description: "Italy region option for Bing wallpaper",
  },
  es: {
    id: "backgrounds.bing.region.es",
    defaultMessage: "Spain (ES/es)",
    description: "Spain region option for Bing wallpaper",
  },
  caEn: {
    id: "backgrounds.bing.region.caEn",
    defaultMessage: "Canada (CA/en)",
    description: "Canada English region option for Bing wallpaper",
  },
  caFr: {
    id: "backgrounds.bing.region.caFr",
    defaultMessage: "Canada (CA/fr)",
    description: "Canada French region option for Bing wallpaper",
  },
  in: {
    id: "backgrounds.bing.region.in",
    defaultMessage: "India (IN/en)",
    description: "India region option for Bing wallpaper",
  },
  cn: {
    id: "backgrounds.bing.region.cn",
    defaultMessage: "China (CN/zh)",
    description: "China region option for Bing wallpaper",
  },
  jp: {
    id: "backgrounds.bing.region.jp",
    defaultMessage: "Japan (JP/ja)",
    description: "Japan region option for Bing wallpaper",
  },
  br: {
    id: "backgrounds.bing.region.br",
    defaultMessage: "Brazil (BR/pt)",
    description: "Brazil region option for Bing wallpaper",
  },
});

const locales = [
  { code: "ROW/en", msg: regionMessages.row },
  { code: "US/en", msg: regionMessages.us },
  { code: "GB/en", msg: regionMessages.gb },
  { code: "DE/de", msg: regionMessages.de },
  { code: "FR/fr", msg: regionMessages.fr },
  { code: "IT/it", msg: regionMessages.it },
  { code: "ES/es", msg: regionMessages.es },
  { code: "CA/en", msg: regionMessages.caEn },
  { code: "CA/fr", msg: regionMessages.caFr },
  { code: "IN/en", msg: regionMessages.in },
  { code: "CN/zh", msg: regionMessages.cn },
  { code: "JP/ja", msg: regionMessages.jp },
  { code: "BR/pt", msg: regionMessages.br },
];

const BingSettings: FC<Props> = ({ data = defaultData, setData }) => {
  const intl = useIntl();

  return (
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
            <option value={l.code} key={l.code}>
              {intl.formatMessage(l.msg)}
            </option>
          ))}
        </select>
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.showTitle}
          onChange={(event) =>
            setData({ ...data, showTitle: event.target.checked })
          }
        />
        <FormattedMessage {...backgroundMessages.showTitle} />
      </label>
    </div>
  );
};

export default BingSettings;
