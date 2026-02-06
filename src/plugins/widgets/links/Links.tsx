import React, { FC, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import { useIntl } from "react-intl";
import { useKeyPress, useToggle } from "../../../hooks";
import Display from "./Display";
import "./Links.sass";
import { Props, defaultCache, defaultData, Link } from "./types";

const Links: FC<Props> = ({
  data = defaultData,
  setData,
  cache = defaultCache,
  setCache,
}) => {
  const [visible, toggleVisible] = useToggle();

  const intl = useIntl();

  // Ensure all links have unique IDs and migrate SVGs to cache
  useEffect(() => {
    let changed = false;
    let cacheChanged = false;
    const newCache = { ...cache };

    const linksWithIds = data.links.map((link, index) => {
      const updatedLink = { ...link } as any; // Cast to any to handle legacy fields during migration
      let linkModified = false;

      // Ensure all links have unique IDs
      if (
        !updatedLink.id ||
        data.links.filter((l) => l.id === updatedLink.id).length > 1
      ) {
        updatedLink.id =
          Date.now().toString(36) + Math.random().toString(36).slice(2) + index;
        linkModified = true;
      }

      // Migrate IconString (Custom Iconify) to iconifyValue
      if (
        updatedLink.icon === "_custom_iconify" &&
        updatedLink.IconString &&
        !updatedLink.iconifyValue
      ) {
        updatedLink.iconifyValue = updatedLink.IconString;
        updatedLink.iconifyIdentifier = ""; // It's usually already in the string
        delete updatedLink.IconString;
        linkModified = true;
      }

      // Migrate SvgString from Data to Cache
      if (
        updatedLink.icon === "_custom_svg" &&
        updatedLink.SvgString &&
        !updatedLink.iconCacheKey
      ) {
        const cacheKey = `migrated_svg_${updatedLink.id}_${Date.now()}`;
        newCache[cacheKey] = {
          data: updatedLink.SvgString,
          type: "svg",
          size: updatedLink.customWidth || 24,
        };

        updatedLink.iconCacheKey = cacheKey;
        delete updatedLink.SvgString;

        linkModified = true;
        cacheChanged = true;
      }

      // Migrate IconStringIco from Data to Cache
      if (
        updatedLink.icon === "_custom_ico" &&
        updatedLink.IconStringIco &&
        !updatedLink.iconCacheKey
      ) {
        const cacheKey = `migrated_ico_${updatedLink.id}_${Date.now()}`;
        newCache[cacheKey] = {
          data: updatedLink.IconStringIco,
          type: "ico",
          size: updatedLink.customWidth || 24,
        };

        updatedLink.iconCacheKey = cacheKey;
        delete updatedLink.IconStringIco;

        linkModified = true;
        cacheChanged = true;
      }

      if (linkModified) {
        changed = true;
        return updatedLink as Link;
      }
      return link;
    });

    if (changed) {
      setData({ ...data, links: linksWithIds });
    }

    if (cacheChanged) {
      setCache(newCache);
    }
  }, [data.links, setData, cache, setCache]);

  const handleLinkClick = (id: string) => {
    const updatedLinks = [...data.links];
    const originalIndex = updatedLinks.findIndex((link) => link.id === id);

    if (originalIndex !== -1) {
      updatedLinks[originalIndex] = {
        ...updatedLinks[originalIndex],
        lastUsed: Date.now(),
      };
      setData({ ...data, links: updatedLinks });
    }
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
          const bTime = b.lastUsed || 0;
          const aTime = a.lastUsed || 0;
          return bTime - aTime; // Most recent first
        }
        default:
          return 0;
      }
    });
  }, [data.links, data.sortBy]);

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
      className={`Links ${data.centerLinks ? "center-links" : ""}`.trim()}
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
            cache={cache}
            onLinkClick={() => handleLinkClick(link.id)}
            {...link}
          />
        ))
      ) : (
        <a
          onClick={toggleVisible}
          title={intl.formatMessage({
            id: "plugins.links.showQuickLinks",
            description: "Tooltip to show quick links",
            defaultMessage: "Show quick links",
          })}
        >
          <Icon icon="fe:insert-link" />
        </a>
      )}
    </div>
  );
};

export default Links;
