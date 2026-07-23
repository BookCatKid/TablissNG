import { nanoid } from "nanoid";
import type { FC } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";

import {
  CRYPTO_ASSETS,
  FIAT_CURRENCIES,
  METAL_ASSETS,
  TARGET_ASSETS,
} from "./assets";
import { defaultData, Pair, Props } from "./types";

const messages = defineMessages({
  fromLabel: {
    id: "plugins.currencyRates.fromLabel",
    defaultMessage: "From",
    description: "Label for the source asset dropdown",
  },
  toLabel: {
    id: "plugins.currencyRates.toLabel",
    defaultMessage: "To",
    description: "Label for the target currency dropdown",
  },
  removePair: {
    id: "plugins.currencyRates.removePair",
    defaultMessage: "Remove pair",
    description: "Button to remove a currency pair",
  },
  addPair: {
    id: "plugins.currencyRates.addPair",
    defaultMessage: "Add pair",
    description: "Button to add a new currency pair",
  },
  refreshInterval: {
    id: "plugins.currencyRates.refreshInterval",
    defaultMessage: "Refresh interval (minutes)",
    description: "Label for the refresh interval input",
  },
  decimals: {
    id: "plugins.currencyRates.decimals",
    defaultMessage: "Decimal places",
    description: "Label for the decimal places input",
  },
  showChange: {
    id: "plugins.currencyRates.showChange",
    defaultMessage: "Show 24h change",
    description: "Checkbox to show the 24 hour change percentage",
  },
  showIcons: {
    id: "plugins.currencyRates.showIcons",
    defaultMessage: "Show currency icons",
    description: "Checkbox to show an icon next to each currency's name",
  },
  groupCrypto: {
    id: "plugins.currencyRates.groupCrypto",
    defaultMessage: "Cryptocurrencies",
    description: "Optgroup label for cryptocurrencies",
  },
  groupMetals: {
    id: "plugins.currencyRates.groupMetals",
    defaultMessage: "Precious metals",
    description: "Optgroup label for precious metals",
  },
  groupFiat: {
    id: "plugins.currencyRates.groupFiat",
    defaultMessage: "Currencies",
    description: "Optgroup label for fiat currencies",
  },
  attribution: {
    id: "plugins.currencyRates.attribution",
    defaultMessage: "Rates by CoinGecko and open.er-api.com",
    description: "Attribution for the data providers",
  },
});

const CurrencyRatesSettings: FC<Props> = ({ data = defaultData, setData }) => {
  const intl = useIntl();

  const updatePair = (id: string, changes: Partial<Pair>) => {
    setData({
      ...data,
      pairs: data.pairs.map((pair) =>
        pair.id === id ? { ...pair, ...changes } : pair,
      ),
    });
  };

  const removePair = (id: string) => {
    setData({ ...data, pairs: data.pairs.filter((pair) => pair.id !== id) });
  };

  const addPair = () => {
    setData({
      ...data,
      pairs: [...data.pairs, { id: nanoid(), from: "bitcoin", to: "usd" }],
    });
  };

  return (
    <div className="CurrencyRatesSettings">
      {data.pairs.map((pair) => (
        <div className="currency-pair-row" key={pair.id}>
          <label>
            <FormattedMessage {...messages.fromLabel} />
            <select
              value={pair.from}
              onChange={(event) =>
                updatePair(pair.id, { from: event.target.value })
              }
            >
              <optgroup label={intl.formatMessage(messages.groupCrypto)}>
                {CRYPTO_ASSETS.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label={intl.formatMessage(messages.groupMetals)}>
                {METAL_ASSETS.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label={intl.formatMessage(messages.groupFiat)}>
                {FIAT_CURRENCIES.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>

          <input
            type="number"
            min="0"
            step="any"
            value={pair.amount ?? 1}
            onChange={(event) =>
              updatePair(pair.id, {
                amount: Number(event.target.value) || undefined,
              })
            }
          />

          <label>
            <FormattedMessage {...messages.toLabel} />
            <select
              value={pair.to}
              onChange={(event) =>
                updatePair(pair.id, { to: event.target.value })
              }
            >
              {TARGET_ASSETS.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => removePair(pair.id)}
            aria-label={intl.formatMessage(messages.removePair)}
          >
            ✕
          </button>
        </div>
      ))}

      <button type="button" onClick={addPair}>
        <FormattedMessage {...messages.addPair} />
      </button>

      <hr />

      <label>
        <FormattedMessage {...messages.refreshInterval} />
        <input
          type="number"
          min="1"
          max="60"
          value={data.refreshInterval}
          onChange={(event) =>
            setData({
              ...data,
              refreshInterval:
                Number(event.target.value) || defaultData.refreshInterval,
            })
          }
        />
      </label>

      <label>
        <FormattedMessage {...messages.decimals} />
        <input
          type="number"
          min="0"
          max="8"
          value={data.decimals}
          onChange={(event) =>
            setData({
              ...data,
              decimals: Number(event.target.value) || 0,
            })
          }
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.showChange}
          onChange={(event) =>
            setData({ ...data, showChange: event.target.checked })
          }
        />
        <FormattedMessage {...messages.showChange} />
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.showIcons}
          onChange={(event) =>
            setData({ ...data, showIcons: event.target.checked })
          }
        />
        <FormattedMessage {...messages.showIcons} />
      </label>

      <p>
        <FormattedMessage {...messages.attribution} />
      </p>
    </div>
  );
};

export default CurrencyRatesSettings;
