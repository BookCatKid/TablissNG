import "./Quote.sass";

import type { FC } from "react";

import { useCachedEffect } from "../../../hooks";
import { getQuote } from "./api";
import { defaultData, Props } from "./types";

const Quote: FC<Props> = ({ cache, data = defaultData, setCache, loader }) => {
  useCachedEffect(
    () => {
      getQuote(loader, data.category ?? "quotable").then(setCache);
    },
    cache ? cache.timestamp + data.timeout : 0,
    [data.category],
  );

  if (!cache) return null;

  return (
    <div className="Quote">
      <h4 className="QuoteContent">
        “{cache.quote}”
        {cache.author && (
          <sub>
            <br />
            &mdash; {cache.author}
          </sub>
        )}
      </h4>
    </div>
  );
};

export default Quote;
