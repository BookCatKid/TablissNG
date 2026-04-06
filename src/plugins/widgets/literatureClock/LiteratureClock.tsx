import "./LiteratureClock.sass";

import { FC, useEffect } from "react";

import { useTime } from "../../../hooks";
import { getQuoteByTimeCode, getTimeCode } from "./api";
import { defaultData, Props } from "./types";

const LiteratureClock: FC<Props> = ({
  cache,
  data = defaultData,
  setCache,
}) => {
  const time = useTime();
  const timeCode = getTimeCode(time);

  useEffect(() => {
    getQuoteByTimeCode(timeCode, data.sfw)
      .then(setCache)
      .catch((error) => {
        console.error(error);
      });
  }, [timeCode, data.sfw]);

  if (!cache) {
    return null;
  }

  return (
    <div className={`LiteratureClock ${data.centerText ? "center" : ""}`}>
      <blockquote>
        <span className="quote_first">{cache.quote_first}</span>
        <strong className="quote_time_case">{cache.quote_time_case}</strong>
        <span className="quote_last">{cache.quote_last}</span>
      </blockquote>

      {data.showBookAndAuthor && cache.title && cache.author && (
        <cite>
          &mdash;
          <span id="book">{cache.title}</span>
          {", "}
          <span id="author">{cache.author}</span>
        </cite>
      )}
    </div>
  );
};

export default LiteratureClock;
