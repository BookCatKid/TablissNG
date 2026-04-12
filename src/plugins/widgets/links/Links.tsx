import "./Links.sass";

import { Icon } from "@iconify/react";
import { FC, useEffect, useMemo } from "react";
import { defineMessages, useIntl } from "react-intl";

import { useKeyPress, useToggle } from "../../../hooks";
import { Display } from "./Display";
import { migrateLinks } from "./migrate";
import { sortLinks } from "./sortLinks";
import { defaultCache, defaultData, Props } from "./types";

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

  // Ensure all links have unique IDs and migrate legacy data
  useEffect(() => {
    const {
      data: migratedData,
      cache: migratedCache,
      changed,
      cacheChanged,
    } = migrateLinks(data, cache);

    if (changed) {
      setData(migratedData);
    }

    if (cacheChanged) {
      setCache(migratedCache);
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

  const sortedLinks = useMemo(
    () => sortLinks(data.links, data.sortBy),
    [data.links, data.sortBy],
  );

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
          title={intl.formatMessage(messages.showQuickLinks)}
        >
          <Icon icon="fe:insert-link" />
        </a>
      )}
    </div>
  );
};

export default Links;
