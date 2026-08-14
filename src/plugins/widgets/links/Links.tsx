import "./Links.sass";

import { Icon } from "@iconify/react";
import { FC, useEffect, useMemo } from "react";
import { defineMessages, useIntl } from "react-intl";

import { useKeyPress, useToggle } from "../../../hooks";
import { Display } from "./Display";
import {
  defaultCache,
  defaultData,
  getCachedIcon,
  getLastUsed,
  getSvgCacheKey,
  LAST_USED_CACHE_KEY,
  Props,
  sanitizeLink,
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

  // Keep link IDs stable and migrate the volatile last-used timestamps out of
  // the synced data store. This prevents every click from rewriting the full
  // links payload in storage.sync and preserves the existing sort behavior.
  useEffect(() => {
    const linksWithIds = data.links.map((link, index) => {
      const linkWithoutLastUsed = { ...link };
      delete linkWithoutLastUsed.lastUsed;
      const hasUniqueId =
        Boolean(link.id) &&
        data.links.filter((candidate) => candidate.id === link.id).length === 1;

      if (!hasUniqueId) {
        return {
          ...linkWithoutLastUsed,
          id:
            Date.now().toString(36) +
            Math.random().toString(36).slice(2) +
            index,
        };
      }

      return linkWithoutLastUsed;
    });

    let cacheChanged = false;
    const nextCache = { ...cache };
    const normalizedLinks = linksWithIds.map((link) => {
      const legacySvg = link.SvgString;
      const normalized = sanitizeLink(link);

      if (normalized.icon === "_custom_svg") {
        const cacheKey =
          normalized.iconCacheKey || getSvgCacheKey(normalized.id);
        normalized.iconCacheKey = cacheKey;
        delete normalized.SvgString;

        if (legacySvg && getCachedIcon(cache, cacheKey)?.type !== "svg") {
          nextCache[cacheKey] = {
            data: legacySvg,
            type: "svg",
            size: legacySvg.length,
          };
          cacheChanged = true;
        }
      }

      return normalized;
    });

    const lastUsed = Object.fromEntries(
      normalizedLinks.flatMap((link, index) => {
        const value = getLastUsed(data.links[index], cache);
        return value > 0 ? [[link.id, value]] : [];
      }),
    );
    const currentLastUsed = cache[LAST_USED_CACHE_KEY];
    const nextLastUsed =
      Object.keys(lastUsed).length > 0
        ? { type: "lastUsed" as const, data: lastUsed, size: 0 as const }
        : undefined;

    // Only update when something actually changed. In particular, remove the
    // legacy lastUsed fields from synced data after copying them to the cache.
    if (JSON.stringify(normalizedLinks) !== JSON.stringify(data.links)) {
      setData({ ...data, links: normalizedLinks });
    }

    if (JSON.stringify(currentLastUsed) !== JSON.stringify(nextLastUsed)) {
      if (nextLastUsed) nextCache[LAST_USED_CACHE_KEY] = nextLastUsed;
      else delete nextCache[LAST_USED_CACHE_KEY];
      cacheChanged = true;
    }

    if (cacheChanged) setCache(nextCache);
  }, [cache, data, data.links, setCache, setData]);

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
