import "./Links.sass";

import { Icon } from "@iconify/react";
import { FC, useEffect, useMemo, useRef } from "react";
import { defineMessages, useIntl } from "react-intl";

import { useKeyPress, useToggle } from "../../../hooks";
import { Display } from "./Display";
import {
  areLastUsedCacheEqual,
  areLinksEqual,
  defaultCache,
  defaultData,
  getCachedIcon,
  getLastUsed,
  getSvgCacheKey,
  LAST_USED_CACHE_KEY,
  normalizeLinks,
  Props,
  setLastUsed,
} from "./types";

const messages = defineMessages({
  showQuickLinks: {
    id: "plugins.links.showQuickLinks",
    description: "Tooltip to show quick links",
    defaultMessage: "Show quick links",
  },
});

const Links: FC<Props> = ({
  data = defaultData,
  setData,
  cache = defaultCache,
  setCache,
}) => {
  const [visible, toggleVisible] = useToggle();

  const intl = useIntl();
  const links = data.links;
  const dataRef = useRef(data);
  const setDataRef = useRef(setData);
  const setCacheRef = useRef(setCache);
  dataRef.current = data;
  setDataRef.current = setData;
  setCacheRef.current = setCache;

  const normalizedLinks = useMemo(() => normalizeLinks(links), [links]);

  // Keep normalization independent from unrelated widget settings. The setter
  // refs avoid rerunning this migration when the API creates a new callback.
  useEffect(() => {
    if (!areLinksEqual(links, normalizedLinks)) {
      setDataRef.current({ ...dataRef.current, links: normalizedLinks });
    }
  }, [links, normalizedLinks]);

  // Migrate volatile timestamps and legacy SVG payloads into the local cache.
  useEffect(() => {
    let cacheChanged = false;
    const nextCache = { ...cache };

    links.forEach((link, index) => {
      const normalized = normalizedLinks[index];
      const legacySvg = link.SvgString;

      if (normalized.icon !== "_custom_svg" || !legacySvg) return;

      const cacheKey = normalized.iconCacheKey || getSvgCacheKey(normalized.id);
      if (getCachedIcon(cache, cacheKey)?.type === "svg") return;

      nextCache[cacheKey] = {
        data: legacySvg,
        type: "svg",
        size: legacySvg.length,
      };
      cacheChanged = true;
    });

    const lastUsed = Object.fromEntries(
      normalizedLinks.flatMap((link, index) => {
        const value = getLastUsed(links[index], cache);
        return value > 0 ? [[link.id, value]] : [];
      }),
    );
    const nextLastUsed =
      Object.keys(lastUsed).length > 0
        ? { type: "lastUsed" as const, data: lastUsed, size: 0 as const }
        : undefined;

    if (!areLastUsedCacheEqual(cache[LAST_USED_CACHE_KEY], nextLastUsed)) {
      if (nextLastUsed) nextCache[LAST_USED_CACHE_KEY] = nextLastUsed;
      else delete nextCache[LAST_USED_CACHE_KEY];
      cacheChanged = true;
    }

    if (cacheChanged) setCacheRef.current(nextCache);
  }, [cache, links, normalizedLinks]);

  const handleLinkClick = (id: string) => {
    setCache(setLastUsed(cache, id, Date.now()));
  };

  const sortedLinks = useMemo(() => {
    if (data.sortBy === "none") return data.links;

    return [...data.links].sort((a, b) => {
      switch (data.sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "icon":
          return (a.icon || "").localeCompare(b.icon || "");
        case "lastUsed": {
          const bTime = getLastUsed(b, cache);
          const aTime = getLastUsed(a, cache);
          return bTime - aTime; // Most recent first
        }
        default:
          return 0;
      }
    });
  }, [cache, data.links, data.sortBy]);

  const keyToIndex = useMemo(() => {
    const map = new Map<string, number>();
    sortedLinks.forEach((link, idx) => {
      if (link.keyboardShortcut && link.keyboardShortcut.length > 0) {
        map.set(link.keyboardShortcut, idx);
      } else {
        map.set(String(idx + 1), idx);
      }
    });
    return map;
  }, [sortedLinks]);

  useKeyPress(({ key }) => {
    const index = keyToIndex.get(key);

    if (index !== undefined && sortedLinks[index]) {
      if (data.linkOpenStyle) {
        window.open(sortedLinks[index].url, "_blank");
      } else {
        window.location.assign(sortedLinks[index].url);
      }
    }
  }, Array.from(keyToIndex.keys()));

  return (
    <div
      className="Links"
      style={{
        gridTemplateColumns:
          data.visible || visible ? "1fr ".repeat(data.columns) : "1fr",
        textAlign: data.columns > 1 ? "left" : "inherit",
      }}
    >
      {data.visible || visible ? (
        sortedLinks.map((link, index) => (
          <Display
            key={link.id}
            number={index + 1}
            linkOpenStyle={data.linkOpenStyle}
            linksNumbered={data.linksNumbered}
            customWidth={data.customWidth}
            customHeight={data.customHeight}
            cache={cache}
            onLinkClick={() => handleLinkClick(link.id)}
            {...link}
          />
        ))
      ) : (
        <a
          onClick={toggleVisible}
          title={intl.formatMessage(messages.showQuickLinks)}
        >
          <Icon icon="fe:insert-link" />
        </a>
      )}
    </div>
  );
};

export default Links;
