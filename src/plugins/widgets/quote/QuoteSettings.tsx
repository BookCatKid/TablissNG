import type { FC } from "react";
// import categories from "./categories";
import { FormattedMessage } from "react-intl";

import { pluginMessages, timingMessages } from "../../../locales/messages";
import { HOURS, MINUTES } from "../../../utils";
import { defaultData, Props } from "./types";

const QuoteSettings: FC<Props> = ({ data = defaultData, setData }) => (
  <div className="QuoteSettings">
    {/* <h5><FormattedMessage
          id="plugins.quotes.dailyQuotes"
          defaultMessage="Daily Quotes"
          description="Daily Quotes title"
        /></h5>
    {categories.map((category) => (
      <label key={category.key}>
        <input
          type="radio"
          checked={data.category === category.key}
          onChange={() => setData({ category: category.key })}
        />{" "}
        {category.name}
      </label>
    ))}
    <p>
    <FormattedMessage
          {...pluginMessages.poweredBy}
        />{" "}
      <a
        href="https://theysaidso.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        They Said So
      </a>
    </p> */}
    <p>
      <FormattedMessage
        id="plugins.quotes.unavailableNotice"
        defaultMessage="Daily Quotes from 'They Said So' are no longer available, I apologize for the inconvenience this may have caused."
        description="Notice about unavailable quotes service"
      />
    </p>
    <label>
      <input
        type="radio"
        checked={data.category === "dwyl"}
        onChange={() => setData({ ...data, category: "dwyl" })}
      />{" "}
      <FormattedMessage
        id="plugins.quotes.dwylQuotes"
        defaultMessage="Quotes from 'dwyl'"
        description="DWYL quotes option"
      />
    </label>
    <p>
      <FormattedMessage {...pluginMessages.poweredBy} />{" "}
      <a
        href="https://github.com/dwyl/quotes"
        target="_blank"
        rel="noopener noreferrer"
      >
        DWYL Quotes
      </a>
    </p>
    <label>
      <input
        type="radio"
        checked={data.category === "quotable"}
        onChange={() => setData({ ...data, category: "quotable" })}
      />{" "}
      <FormattedMessage
        id="plugins.quotes.quotableQuote"
        defaultMessage="Random Quotable Quote"
        description="Quotable quotes option"
      />
    </label>
    <p>
      <FormattedMessage {...pluginMessages.poweredBy} />{" "}
      <a
        href="https://github.com/lukePeavey/quotable"
        target="_blank"
        rel="noopener noreferrer"
      >
        Quotable
      </a>
    </p>

    <label>
      <input
        type="radio"
        checked={data.category === "randomBible"}
        onChange={() => setData({ ...data, category: "randomBible" })}
      />{" "}
      <FormattedMessage
        id="plugins.quotes.randomBibleVerse"
        defaultMessage="Random Bible Verse"
        description="Bible verse option"
      />
    </label>
    <p>
      <FormattedMessage
        id="plugins.quotes.randomBibleVerseDescription"
        defaultMessage="Top inspirational verses from the Bible."
        description="Bible verse description"
      />
    </p>

    <h5>
      <FormattedMessage
        id="plugins.quotes.hourlyQuotes"
        defaultMessage="Hourly Quotes"
        description="Hourly Quotes title"
      />
    </h5>
    <label>
      <input
        type="radio"
        checked={data.category === "developerexcuses"}
        onChange={() => setData({ ...data, category: "developerexcuses" })}
      />{" "}
      <FormattedMessage
        id="plugins.quotes.developerExcuses"
        defaultMessage="Developer Excuses"
        description="Developer excuses option"
      />
    </label>
    <p>
      <FormattedMessage {...pluginMessages.poweredBy} />{" "}
      <a
        href="http://www.developerexcuses.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Developer Excuses
      </a>
    </p>

    <label>
      <FormattedMessage
        id="plugins.quotes.showANewQuote"
        defaultMessage="Show a new quote"
        description="Show a new quote title"
      />
      <select
        value={data.timeout}
        onChange={(event) =>
          setData({ ...data, timeout: Number(event.target.value) })
        }
      >
        <option value={5 * MINUTES}>
          <FormattedMessage {...timingMessages.every5min} />
        </option>
        <option value={15 * MINUTES}>
          <FormattedMessage {...timingMessages.every15min} />
        </option>
        <option value={HOURS}>
          <FormattedMessage {...timingMessages.everyHour} />
        </option>
        <option value={24 * HOURS}>
          <FormattedMessage {...timingMessages.everyDay} />
        </option>
        <option value={7 * 24 * HOURS}>
          <FormattedMessage {...timingMessages.everyWeek} />
        </option>
      </select>
    </label>
  </div>
);

export default QuoteSettings;
