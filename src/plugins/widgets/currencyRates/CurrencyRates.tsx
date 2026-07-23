import "./CurrencyRates.sass";

import { Icon } from "@iconify/react";
import type { FC } from "react";
import { defineMessages, useIntl } from "react-intl";

import { usePushError } from "../../../api";
import { db } from "../../../db/state";
import { useCachedEffect } from "../../../hooks";
import { useValue } from "../../../lib/db/react";
import { MINUTES } from "../../../utils";
import { getRates, rateKey } from "./api";
import { getAsset } from "./assets";
import { defaultData, Props } from "./types";

const messages = defineMessages({
  loading: {
    id: "plugins.currencyRates.loading",
    defaultMessage: "Loading rates…",
    description: "Loading state for the currency rates widget",
  },
  noPairs: {
    id: "plugins.currencyRates.noPairs",
    defaultMessage: "Add a currency pair in settings to get started.",
    description: "Empty state when no pairs are configured",
  },
});

const CurrencyRates: FC<Props> = ({
  cache,
  data = defaultData,
  setCache,
  loader,
}) => {
  const intl = useIntl();
  const pushError = usePushError();
  const locale = useValue(db, "locale");
  const pairsKey = JSON.stringify(data.pairs);

  useCachedEffect(
    () => {
      getRates(data.pairs, loader)
        .then((rates) => setCache({ rates, timestamp: Date.now() }))
        .catch(pushError);
    },
    cache ? cache.timestamp + data.refreshInterval * MINUTES : 0,
    [pairsKey],
  );

  if (data.pairs.length === 0) {
    return (
      <div className="CurrencyRates">
        {intl.formatMessage(messages.noPairs)}
      </div>
    );
  }

  if (!cache) {
    return (
      <div className="CurrencyRates">
        {intl.formatMessage(messages.loading)}
      </div>
    );
  }

  const formatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: data.decimals,
  });

  return (
    <div className="CurrencyRates">
      {data.pairs.map((pair) => {
        const rate = cache.rates[rateKey(pair.from, pair.to)];
        const fromAsset = getAsset(pair.from);
        const toAsset = getAsset(pair.to);
        const amount = pair.amount ?? 1;

        return (
          <div className="currency-rate-row" key={pair.id}>
            <span className="currency-rate-from">
              {data.showIcons && fromAsset && (
                <Icon className="currency-rate-icon" icon={fromAsset.icon} />
              )}
              {amount} {fromAsset?.symbol ?? pair.from.toUpperCase()}
            </span>
            <span className="currency-rate-equals">=</span>
            {rate ? (
              <span className="currency-rate-value">
                {formatter.format(rate.value * amount)}{" "}
                {data.showIcons && toAsset && (
                  <Icon className="currency-rate-icon" icon={toAsset.icon} />
                )}
                {toAsset?.symbol ?? pair.to.toUpperCase()}
                {data.showChange && typeof rate.change24h === "number" && (
                  <span
                    className={`currency-rate-change currency-rate-change--${
                      rate.change24h >= 0 ? "up" : "down"
                    }`}
                  >
                    {rate.change24h >= 0 ? "▲" : "▼"}{" "}
                    {Math.abs(rate.change24h).toFixed(2)}%
                  </span>
                )}
              </span>
            ) : (
              <span className="currency-rate-value currency-rate-value--unavailable">
                —
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CurrencyRates;
