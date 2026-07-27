import "./PairRow.sass";

import type { FC } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";

import {
  DownIcon,
  IconButton,
  RemoveIcon,
  UpIcon,
} from "../../../views/shared";
import AssetPicker from "./AssetPicker";
import { isSupportedPair, resolveAsset } from "./assets";
import { Pair } from "./types";

const messages = defineMessages({
  removePair: {
    id: "plugins.currencyRates.removePair",
    defaultMessage: "Remove pair",
    description: "Button to remove a currency pair",
  },
  moveUp: {
    id: "plugins.currencyRates.moveUp",
    defaultMessage: "Move pair up",
    description: "Button to move a currency pair up in the list",
  },
  moveDown: {
    id: "plugins.currencyRates.moveDown",
    defaultMessage: "Move pair down",
    description: "Button to move a currency pair down in the list",
  },
  pairNumber: {
    id: "plugins.currencyRates.pairNumber",
    defaultMessage: "Pair {number}",
    description: "Heading for a currency pair row",
  },
  showChange: {
    id: "plugins.currencyRates.showChange",
    defaultMessage: "Show 24h change",
    description: "Checkbox to show the 24 hour change percentage for this pair",
  },
  showIcons: {
    id: "plugins.currencyRates.showIcons",
    defaultMessage: "Show currency icons",
    description: "Checkbox to show an icon next to this pair's currencies",
  },
  amount: {
    id: "plugins.currencyRates.amount",
    defaultMessage: "Amount",
    description:
      "Label for the number of units of the source currency to convert",
  },
  currency: {
    id: "plugins.currencyRates.currency",
    defaultMessage: "Currency",
    description: "Caption above the source currency picker",
  },
  to: {
    id: "plugins.currencyRates.to",
    defaultMessage: "to",
    description: "Separator between the source and target currency pickers",
  },
  unsupportedPair: {
    id: "plugins.currencyRates.unsupportedPair",
    defaultMessage:
      "This currency pair isn't supported by the price provider and won't show a value.",
    description:
      "Warning shown when a pair's from/to combination can't be priced",
  },
});

type Props = {
  pair: Pair;
  number: number;
  locale: string;
  onChange: (changes: Partial<Pair>) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
};

const PairRow: FC<Props> = ({
  pair,
  number,
  locale,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}) => {
  const intl = useIntl();
  const fromAsset = resolveAsset(pair, "from", locale);
  const fromCategory = fromAsset?.category ?? "crypto";
  const supportsChange = fromCategory !== "fiat";
  const supported = isSupportedPair(pair.from, pair.to, locale);

  return (
    <div className="PairRow">
      <h5>
        <div className="title--buttons">
          <IconButton
            onClick={onRemove}
            title={intl.formatMessage(messages.removePair)}
          >
            <RemoveIcon />
          </IconButton>
          {onMoveDown && (
            <IconButton
              onClick={onMoveDown}
              title={intl.formatMessage(messages.moveDown)}
            >
              <DownIcon />
            </IconButton>
          )}
          {onMoveUp && (
            <IconButton
              onClick={onMoveUp}
              title={intl.formatMessage(messages.moveUp)}
            >
              <UpIcon />
            </IconButton>
          )}
        </div>
        <FormattedMessage {...messages.pairNumber} values={{ number }} />
      </h5>

      <div className="PairRow-fields">
        <label className="PairRow-amount">
          <FormattedMessage {...messages.amount} />
          <input
            type="number"
            min="0"
            step="any"
            value={pair.amount ?? 1}
            onChange={(event) =>
              onChange({ amount: Number(event.target.value) || undefined })
            }
          />
        </label>

        <div className="PairRow-currency">
          <span className="PairRow-fieldLabel">
            <FormattedMessage {...messages.currency} />
          </span>

          <AssetPicker
            side="from"
            value={pair.from}
            customAsset={pair.customAsset}
            onChange={(id, customAsset) => onChange({ from: id, customAsset })}
          />

          <span className="PairRow-fieldLabel">
            <FormattedMessage {...messages.to} />
          </span>

          <AssetPicker
            side="to"
            value={pair.to}
            onChange={(id) => onChange({ to: id })}
          />
        </div>
      </div>

      {!supported && (
        <p className="PairRow-warning">
          {intl.formatMessage(messages.unsupportedPair)}
        </p>
      )}

      <div className="PairRow-options">
        {supportsChange && (
          <label>
            <input
              type="checkbox"
              checked={pair.showChange ?? true}
              onChange={(event) =>
                onChange({ showChange: event.target.checked })
              }
            />
            <FormattedMessage {...messages.showChange} />
          </label>
        )}

        <label>
          <input
            type="checkbox"
            checked={pair.showIcons ?? false}
            onChange={(event) => onChange({ showIcons: event.target.checked })}
          />
          <FormattedMessage {...messages.showIcons} />
        </label>
      </div>

      <hr />
    </div>
  );
};

export default PairRow;
