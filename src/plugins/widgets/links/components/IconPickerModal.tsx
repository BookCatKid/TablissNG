import type { FC } from "react";
import { useEffect, useMemo, useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";

import { iconCatalog, IconPreview } from "../../../../icons";
import {
  browseIconSet,
  type IconResults,
  type IconSet,
  listIconSets,
  searchIcons,
} from "../../../../icons/discovery";
import Modal from "../../../../views/shared/modal/Modal";

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconString: string) => void;
  selectedIcon?: string;
}

type RequestState =
  | { status: "idle" | "loading"; icons: string[]; total: number }
  | { status: "ready"; icons: string[]; total: number }
  | { status: "error"; icons: string[]; total: number };

const FEATHER_SCOPE = "feather";
const ALL_SCOPE = "all";
const PAGE_SIZE = 96;

const messages = defineMessages({
  title: {
    id: "plugins.links.iconPicker.title",
    defaultMessage: "Choose an icon",
    description: "Title of the icon picker dialog",
  },
  iconSet: {
    id: "plugins.links.iconPicker.iconSet",
    defaultMessage: "Icon set",
    description: "Label for the icon set selector",
  },
  feather: {
    id: "plugins.links.iconPicker.feather",
    defaultMessage: "Feather",
    description: "Feather option in the icon set selector",
  },
  allSets: {
    id: "plugins.links.iconPicker.allSets",
    defaultMessage: "All Iconify sets",
    description: "Option to search all Iconify icon sets",
  },
  browseSet: {
    id: "plugins.links.iconPicker.browseSet",
    defaultMessage: "Browse a set",
    description: "Label for the group of individual Iconify sets",
  },
  loadingSets: {
    id: "plugins.links.iconPicker.loadingSets",
    defaultMessage: "Loading icon sets...",
    description: "Loading state for Iconify set metadata",
  },
  setOption: {
    id: "plugins.links.iconPicker.setOption",
    defaultMessage: "{name} ({count, number})",
    description: "Icon set option with its icon count",
  },
  search: {
    id: "plugins.links.input.searchIcons",
    defaultMessage: "Search icons...",
    description: "Placeholder text for searching icons",
  },
  searchAll: {
    id: "plugins.links.iconPicker.searchAll",
    defaultMessage: "Search all icon sets...",
    description: "Placeholder for global Iconify search",
  },
  searchPrompt: {
    id: "plugins.links.iconPicker.searchPrompt",
    defaultMessage: "Enter a search term",
    description: "Prompt shown before searching all Iconify icon sets",
  },
  searching: {
    id: "plugins.links.iconPicker.searching",
    defaultMessage: "Searching...",
    description: "Loading state for Iconify search",
  },
  loadingSet: {
    id: "plugins.links.iconPicker.loadingSet",
    defaultMessage: "Loading icon set...",
    description: "Loading state when browsing an Iconify set",
  },
  unavailable: {
    id: "plugins.links.iconPicker.unavailable",
    defaultMessage:
      "Iconify could not be reached. Feather icons are still available offline.",
    description: "Error shown when Iconify discovery is unavailable",
  },
  retry: {
    id: "plugins.links.iconPicker.retry",
    defaultMessage: "Retry",
    description: "Button to retry Iconify discovery",
  },
  noResults: {
    id: "plugins.links.input.noIconsFound",
    defaultMessage: "No icons found",
    description: "Message shown when icon search has no results",
  },
  showMore: {
    id: "plugins.links.iconPicker.showMore",
    defaultMessage: "Show more",
    description: "Button that reveals more icons from a collection",
  },
  resultLabel: {
    id: "plugins.links.iconPicker.resultLabel",
    defaultMessage: "{icon}, {set}",
    description: "Accessible name for an icon from a non-Feather set",
  },
});

const emptyRequest: RequestState = { status: "idle", icons: [], total: 0 };

export const IconPickerModal: FC<IconPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedIcon,
}) => {
  const [scope, setScope] = useState(FEATHER_SCOPE);
  const [searchQuery, setSearchQuery] = useState("");
  const [iconSets, setIconSets] = useState<IconSet[]>([]);
  const [setsLoading, setSetsLoading] = useState(false);
  const [requestState, setRequestState] = useState<RequestState>(emptyRequest);
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);
  const [retryKey, setRetryKey] = useState(0);
  const intl = useIntl();

  useEffect(() => {
    if (!isOpen || iconSets.length > 0) return;
    const controller = new AbortController();
    setSetsLoading(true);
    listIconSets(controller.signal)
      .then(setIconSets)
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setIconSets([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setSetsLoading(false);
      });
    return () => controller.abort();
  }, [iconSets.length, isOpen, retryKey]);

  const normalizedQuery = searchQuery.trim();
  const canSearchAll = scope !== ALL_SCOPE || normalizedQuery.length >= 2;

  useEffect(() => {
    if (
      !isOpen ||
      scope === FEATHER_SCOPE ||
      (scope === ALL_SCOPE && !canSearchAll)
    ) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setRequestState({ status: "loading", icons: [], total: 0 });
      const request: Promise<IconResults> =
        scope === ALL_SCOPE
          ? searchIcons(normalizedQuery, undefined, controller.signal)
          : normalizedQuery
            ? searchIcons(normalizedQuery, scope, controller.signal)
            : browseIconSet(scope, controller.signal);

      request
        .then((results) => setRequestState({ status: "ready", ...results }))
        .catch((error: unknown) => {
          if (!(error instanceof DOMException && error.name === "AbortError")) {
            setRequestState({ status: "error", icons: [], total: 0 });
          }
        });
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [canSearchAll, isOpen, normalizedQuery, retryKey, scope]);

  const featherIcons = useMemo(() => {
    const query = normalizedQuery.toLowerCase();
    const dashedQuery = query.replace(/\s/g, "-");
    return iconCatalog.feather
      .filter((icon) => {
        const normalizedIcon = icon.toLowerCase();
        return (
          normalizedIcon.includes(query) || normalizedIcon.includes(dashedQuery)
        );
      })
      .map((icon) => `feather:${icon}`);
  }, [normalizedQuery]);

  if (!isOpen) return null;

  const allResults =
    scope === FEATHER_SCOPE ? featherIcons : requestState.icons;
  const visibleIcons =
    scope === FEATHER_SCOPE ? allResults : allResults.slice(0, visibleLimit);
  const showGlobalPrompt = scope === ALL_SCOPE && !canSearchAll;
  const isLoading = requestState.status === "loading";
  const hasError = requestState.status === "error";
  const handleScopeChange = (nextScope: string) => {
    setScope(nextScope);
    setSearchQuery("");
    setVisibleLimit(PAGE_SIZE);
    setRequestState(emptyRequest);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setVisibleLimit(PAGE_SIZE);
  };

  return (
    <Modal
      onClose={onClose}
      className="IconPickerModal Settings"
      center
      footer={
        <button
          type="button"
          className="button button--primary"
          onClick={onClose}
        >
          <FormattedMessage
            id="plugins.links.input.cancel"
            defaultMessage="Cancel"
            description="Button text to cancel icon selection"
          />
        </button>
      }
    >
      <header className="IconPickerModal-header">
        <h4>{intl.formatMessage(messages.title)}</h4>
      </header>

      <div className="IconPickerModal-toolbar">
        <label>
          <span>{intl.formatMessage(messages.iconSet)}</span>
          <select
            value={scope}
            onChange={(event) => handleScopeChange(event.target.value)}
          >
            <option value={FEATHER_SCOPE}>
              {intl.formatMessage(messages.feather)}
            </option>
            <option value={ALL_SCOPE}>
              {intl.formatMessage(messages.allSets)}
            </option>
            <optgroup label={intl.formatMessage(messages.browseSet)}>
              {setsLoading && (
                <option value="" disabled>
                  {intl.formatMessage(messages.loadingSets)}
                </option>
              )}
              {iconSets
                .filter(({ prefix }) => prefix !== FEATHER_SCOPE)
                .map((set) => (
                  <option key={set.prefix} value={set.prefix}>
                    {intl.formatMessage(messages.setOption, {
                      name: set.name,
                      count: set.total,
                    })}
                  </option>
                ))}
            </optgroup>
          </select>
        </label>

        <input
          type="search"
          aria-label={intl.formatMessage(messages.search)}
          placeholder={intl.formatMessage(
            scope === ALL_SCOPE ? messages.searchAll : messages.search,
          )}
          value={searchQuery}
          onChange={(event) => handleSearchChange(event.target.value)}
          autoFocus
        />
      </div>

      {isLoading ? (
        <div className="IconPickerModal-status" aria-live="polite">
          {intl.formatMessage(
            normalizedQuery ? messages.searching : messages.loadingSet,
          )}
        </div>
      ) : null}

      <div className="IconPickerModal-results">
        {hasError ? (
          <div className="IconPickerModal-message">
            <p>{intl.formatMessage(messages.unavailable)}</p>
            <button
              type="button"
              className="button button--primary"
              onClick={() => setRetryKey((value) => value + 1)}
            >
              {intl.formatMessage(messages.retry)}
            </button>
          </div>
        ) : showGlobalPrompt ? (
          <div className="IconPickerModal-message">
            <p>{intl.formatMessage(messages.searchPrompt)}</p>
          </div>
        ) : isLoading ? null : visibleIcons.length > 0 ? (
          <div className="icon-grid">
            {visibleIcons.map((icon) => {
              const [prefix, name] = icon.split(":", 2);
              const label = name.replace(/-/g, " ");
              const collection = iconSets.find((set) => set.prefix === prefix);
              return (
                <button
                  key={icon}
                  className="icon-box"
                  data-selected={icon === selectedIcon || undefined}
                  aria-label={
                    prefix === FEATHER_SCOPE
                      ? label
                      : intl.formatMessage(messages.resultLabel, {
                          icon: label,
                          set: collection?.name ?? prefix,
                        })
                  }
                  onClick={() => onSelect(icon)}
                  type="button"
                >
                  <IconPreview name={icon} width={24} height={24} />
                  <span className="icon-name">{label}</span>
                  {prefix !== FEATHER_SCOPE ? (
                    <span className="icon-prefix">
                      {collection?.name ?? prefix}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="IconPickerModal-message">
            <p>{intl.formatMessage(messages.noResults)}</p>
          </div>
        )}

        {scope !== FEATHER_SCOPE &&
        scope !== ALL_SCOPE &&
        allResults.length > visibleLimit ? (
          <button
            type="button"
            className="button button--primary IconPickerModal-more"
            onClick={() => setVisibleLimit((value) => value + PAGE_SIZE)}
          >
            {intl.formatMessage(messages.showMore)}
          </button>
        ) : null}
      </div>
    </Modal>
  );
};
