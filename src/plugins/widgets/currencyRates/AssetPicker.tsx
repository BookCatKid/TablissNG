import "./AssetPicker.sass";

import { Icon } from "@iconify/react";
import type { FC } from "react";
import { useEffect, useMemo, useState } from "react";
import { defineMessages, useIntl } from "react-intl";

import { db } from "../../../db/state";
import { useDebounce } from "../../../hooks";
import { useValue } from "../../../lib/db/react";
import { searchCoins } from "./api";
import {
  Asset,
  COMMON_FIAT_CODES,
  CRYPTO_ASSETS,
  getTargetAssets,
  isIconUrl,
  METAL_ASSETS,
} from "./assets";
import { CustomAsset } from "./types";

const messages = defineMessages({
  search: {
    id: "plugins.currencyRates.picker.search",
    defaultMessage: "Search currencies…",
    description: "Placeholder for the asset search input",
  },
  noResults: {
    id: "plugins.currencyRates.picker.noResults",
    defaultMessage: "No matches found",
    description: "Message shown when the asset search yields no results",
  },
  moreResults: {
    id: "plugins.currencyRates.picker.moreResults",
    defaultMessage: "More results",
    description: "Divider label above live-searched coins",
  },
  searching: {
    id: "plugins.currencyRates.picker.searching",
    defaultMessage: "Searching…",
    description: "Shown while a live coin search is in flight",
  },
  cancel: {
    id: "plugins.currencyRates.picker.cancel",
    defaultMessage: "Cancel",
    description: "Button to close the asset picker without changing selection",
  },
  open: {
    id: "plugins.currencyRates.picker.open",
    defaultMessage: "Choose a currency",
    description: "Title of the asset picker dialog",
  },
});

type Props = {
  side: "from" | "to";
  value: string;
  customAsset?: CustomAsset;
  onChange: (id: string, customAsset?: CustomAsset) => void;
};

function matches(
  asset: { label: string; symbol: string; id: string },
  query: string,
) {
  const q = query.toLowerCase();
  return (
    asset.label.toLowerCase().includes(q) ||
    asset.symbol.toLowerCase().includes(q) ||
    asset.id.toLowerCase().includes(q)
  );
}

const AssetPicker: FC<Props> = ({ side, value, customAsset, onChange }) => {
  const intl = useIntl();
  const locale = useValue(db, "locale");
  const [isOpen, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [liveResults, setLiveResults] = useState<CustomAsset[]>([]);
  const [searching, setSearching] = useState(false);
  const debouncedQuery = useDebounce(query, 350);

  const baseAssets = useMemo<Asset[]>(() => {
    const fiat = getTargetAssets("fiat", locale).sort((a, b) => {
      const aIndex = COMMON_FIAT_CODES.indexOf(a.id);
      const bIndex = COMMON_FIAT_CODES.indexOf(b.id);
      if (aIndex === -1 && bIndex === -1) return a.label.localeCompare(b.label);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    return [...CRYPTO_ASSETS, ...METAL_ASSETS, ...fiat];
  }, [locale]);

  const selected =
    baseAssets.find((asset) => asset.id === value) ??
    (customAsset ? { ...customAsset, category: "crypto" as const } : undefined);

  const filtered = useMemo(
    () =>
      query ? baseAssets.filter((asset) => matches(asset, query)) : baseAssets,
    [baseAssets, query],
  );

  const filteredIds = useMemo(
    () => new Set(filtered.map((asset) => asset.id)),
    [filtered],
  );
  const extraResults = liveResults.filter(
    (asset) => !filteredIds.has(asset.id),
  );

  const canSearchLive = side === "from";

  useEffect(() => {
    if (!canSearchLive || !isOpen || debouncedQuery.trim().length < 2) {
      setLiveResults([]);
      return;
    }

    let cancelled = false;
    setSearching(true);
    searchCoins(debouncedQuery)
      .then((results) => {
        if (!cancelled) setLiveResults(results);
      })
      .catch(() => {
        if (!cancelled) setLiveResults([]);
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canSearchLive, isOpen, debouncedQuery]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setLiveResults([]);
  };

  const select = (id: string, snapshot?: CustomAsset) => {
    onChange(id, snapshot);
    close();
  };

  return (
    <div className="AssetPicker">
      <button
        type="button"
        className="AssetPicker-trigger"
        onClick={() => setOpen(true)}
      >
        {selected && (
          <span className="AssetPicker-icon">
            {isIconUrl(selected.icon) ? (
              <img src={selected.icon} alt="" />
            ) : (
              <Icon icon={selected.icon} />
            )}
          </span>
        )}
        <span>{selected?.label ?? value.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="AssetPicker-overlay" onClick={close}>
          <div
            className="AssetPicker-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <h4>{intl.formatMessage(messages.open)}</h4>

            <input
              type="text"
              className="AssetPicker-search"
              autoFocus
              placeholder={intl.formatMessage(messages.search)}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />

            <div className="AssetPicker-list">
              {filtered.length === 0 &&
                extraResults.length === 0 &&
                !searching && (
                  <p className="AssetPicker-empty">
                    {intl.formatMessage(messages.noResults)}
                  </p>
                )}

              {filtered.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  className="AssetPicker-option"
                  onClick={() => select(asset.id)}
                >
                  <span className="AssetPicker-icon">
                    {isIconUrl(asset.icon) ? (
                      <img src={asset.icon} alt="" />
                    ) : (
                      <Icon icon={asset.icon} />
                    )}
                  </span>
                  <span>{asset.label}</span>
                </button>
              ))}

              {canSearchLive && (searching || extraResults.length > 0) && (
                <>
                  <p className="AssetPicker-divider">
                    {searching
                      ? intl.formatMessage(messages.searching)
                      : intl.formatMessage(messages.moreResults)}
                  </p>
                  {extraResults.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      className="AssetPicker-option"
                      onClick={() => select(asset.id, asset)}
                    >
                      <span className="AssetPicker-icon">
                        <img src={asset.icon} alt="" />
                      </span>
                      <span>{asset.label}</span>
                    </button>
                  ))}
                </>
              )}
            </div>

            <button
              type="button"
              className="AssetPicker-cancel"
              onClick={close}
            >
              {intl.formatMessage(messages.cancel)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetPicker;
