import React, { FC } from "react";
// import categories from "./categories";
import { FormattedMessage } from "react-intl";
import { pluginMessages } from "../../../locales/messages";
import { Props, defaultData } from "./types";

const QuoteSettings: React.FC<Props> = ({ data = defaultData, setData }) => (
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
        onChange={() => setData({ category: "dwyl" })}
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
        onChange={() => setData({ category: "quotable" })}
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
        onChange={() => setData({ category: "randomBible" })}
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
        onChange={() => setData({ category: "developerexcuses" })}
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
  </div>
);

export default QuoteSettings;
