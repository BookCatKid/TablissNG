import "./CurrencyRates.sass";

import type { FC } from "react";
import { defineMessages, useIntl } from "react-intl";

import { usePushError } from "../../../api";
import { db } from "../../../db/state";
import { useCachedEffect } from "../../../hooks";
import { Icon } from "../../../icons";
import { useValue } from "../../../lib/db/react";
import { getExpiry, getRates, rateKey } from "./api";
import { isIconUrl, resolveAsset } from "./assets";
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

const AssetIcon: FC<{ icon: string }> = ({ icon }) =>
  isIconUrl(icon) ? (
    <img className="currency-rate-icon" src={icon} alt="" />
  ) : (
    <Icon className="currency-rate-icon" name={icon} />
  );

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
    getExpiry(cache, data.refreshInterval),
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
        const fromAsset = resolveAsset(pair, "from", locale);
        const toAsset = resolveAsset(pair, "to", locale);
        const amount = pair.amount ?? 1;
        const showIcons = pair.showIcons ?? false;
        const showChange = pair.showChange ?? true;

        return (
          <div className="currency-rate-row" key={pair.id}>
            <span className="currency-rate-from">
              {showIcons && fromAsset && <AssetIcon icon={fromAsset.icon} />}
              {amount} {fromAsset?.symbol ?? pair.from.toUpperCase()}
            </span>
            <span className="currency-rate-equals">=</span>
            {rate ? (
              <span className="currency-rate-value">
                {formatter.format(rate.value * amount)}{" "}
                {showIcons && toAsset && <AssetIcon icon={toAsset.icon} />}
                {toAsset?.symbol ?? pair.to.toUpperCase()}
                {showChange && typeof rate.change24h === "number" && (
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
