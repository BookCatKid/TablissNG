import type { FC } from "react";
import { defineMessages, FormattedMessage } from "react-intl";

import { db } from "../../../db/state";
import { useSavedReducer } from "../../../hooks";
import { useValue } from "../../../lib/db/react";
import { timingMessages } from "../../../locales/messages";
import { addPair, removePair, reorderPair, updatePair } from "./actions";
import PairRow from "./PairRow";
import { reducer } from "./reducer";
import { defaultData, Pair, Props } from "./types";

const messages = defineMessages({
  addPair: {
    id: "plugins.currencyRates.addPair",
    defaultMessage: "Add pair",
    description: "Button to add a new currency pair",
  },
  refreshInterval: {
    id: "plugins.currencyRates.refreshInterval",
    defaultMessage: "Refresh interval",
    description: "Label for the refresh interval dropdown",
  },
  decimals: {
    id: "plugins.currencyRates.decimals",
    defaultMessage: "Decimal places",
    description: "Label for the decimal places input",
  },
  attribution: {
    id: "plugins.currencyRates.attribution",
    defaultMessage: "Rates by CoinGecko and open.er-api.com",
    description: "Attribution for the data providers",
  },
});

const CurrencyRatesSettings: FC<Props> = ({ data = defaultData, setData }) => {
  const locale = useValue(db, "locale");
  const savePairs = (pairs: Pair[]) => setData({ ...data, pairs });
  const dispatch = useSavedReducer(reducer, data.pairs, savePairs);

  return (
    <div className="CurrencyRatesSettings">
      <label>
        <FormattedMessage {...messages.refreshInterval} />
        <select
          value={data.refreshInterval}
          onChange={(event) =>
            setData({ ...data, refreshInterval: Number(event.target.value) })
          }
        >
          <option value="0">
            <FormattedMessage {...timingMessages.everyNewTab} />
          </option>
          <option value="300">
            <FormattedMessage {...timingMessages.every5min} />
          </option>
          <option value="900">
            <FormattedMessage {...timingMessages.every15min} />
          </option>
          <option value="1800">
            <FormattedMessage {...timingMessages.every30min} />
          </option>
          <option value="3600">
            <FormattedMessage {...timingMessages.everyHour} />
          </option>
          <option value="21600">
            <FormattedMessage {...timingMessages.every6Hours} />
          </option>
        </select>
      </label>

      <label>
        <FormattedMessage {...messages.decimals} />
        <input
          type="number"
          min="0"
          max="8"
          value={data.decimals}
          onChange={(event) =>
            setData({ ...data, decimals: Number(event.target.value) || 0 })
          }
        />
      </label>

      <hr />

      {data.pairs.map((pair, index) => (
        <PairRow
          key={pair.id}
          pair={pair}
          number={index + 1}
          locale={locale}
          onChange={(changes) => dispatch(updatePair(pair.id, changes))}
          onRemove={() => dispatch(removePair(pair.id))}
          onMoveUp={
            index !== 0
              ? () => dispatch(reorderPair(index, index - 1))
              : undefined
          }
          onMoveDown={
            index !== data.pairs.length - 1
              ? () => dispatch(reorderPair(index, index + 1))
              : undefined
          }
        />
      ))}

      <p style={{ marginTop: "0.5rem" }}>
        <button
          className="button button--primary"
          onClick={() => dispatch(addPair())}
        >
          <FormattedMessage {...messages.addPair} />
        </button>
      </p>

      <p>
        <FormattedMessage {...messages.attribution} />
      </p>
    </div>
  );
};

export default CurrencyRatesSettings;
