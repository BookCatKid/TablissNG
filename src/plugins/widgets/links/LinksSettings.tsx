import React, { FC, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { useSavedReducer } from "../../../hooks";
import Input from "./Input";
import { addLink, removeLink, reorderLink, updateLink } from "./actions";
import { reducer } from "./reducer";
import { Data, Link, Props, defaultCache, defaultData } from "./types";

const LinksSettings: FC<Props> = ({
  data = defaultData,
  setData,
  cache = defaultCache,
  setCache,
}) => {
  const saveLinks = (links: Link[]) => setData({ ...data, links });
  const dispatch = useSavedReducer(reducer, data.links, saveLinks);

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

  return (
    <div className="LinksSettings">
      <label>
        <FormattedMessage
          id="plugins.links.numberOfColumns"
          defaultMessage="Number of columns"
          description="Number of columns title"
        />
        <input
          type="number"
          value={data.columns}
          onChange={(event) =>
            setData({ ...data, columns: Number(event.target.value) })
          }
          min={1}
        />
      </label>

      <label>
        <FormattedMessage
          id="plugins.links.sortBy"
          defaultMessage="Sort links by"
          description="Sort links by title"
        />
        <select
          value={data.sortBy}
          onChange={(event) =>
            setData({ ...data, sortBy: event.target.value as Data["sortBy"] })
          }
        >
          <option value="none">
            <FormattedMessage
              id="plugins.links.sortBy.manual"
              defaultMessage="Manual order"
              description="Manual sorting option"
            />
          </option>
          <option value="name">
            <FormattedMessage
              id="plugins.links.sortBy.name"
              defaultMessage="Name"
              description="Sort by name option"
            />
          </option>
          <option value="icon">
            <FormattedMessage
              id="plugins.links.sortBy.icon"
              defaultMessage="Icon type"
              description="Sort by icon type option"
            />
          </option>
          <option value="lastUsed">
            <FormattedMessage
              id="plugins.links.sortBy.lastUsed"
              defaultMessage="Most recently used"
              description="Sort by most recently used option"
            />
          </option>
        </select>
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.visible}
          onChange={() => setData({ ...data, visible: !data.visible })}
        />
        <FormattedMessage
          id="plugins.links.areAlwaysVisible"
          defaultMessage="Links are always visible"
          description="Links are always visible title"
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.linkOpenStyle}
          onChange={() =>
            setData({ ...data, linkOpenStyle: !data.linkOpenStyle })
          }
        />
        <FormattedMessage
          id="plugins.links.openInANewTab"
          defaultMessage="Links open in a new tab"
          description="Links open in a new tab title"
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.linksNumbered}
          onChange={() =>
            setData({ ...data, linksNumbered: !data.linksNumbered })
          }
        />
        <FormattedMessage
          id="plugins.links.areNumbered"
          defaultMessage="Links are numbered"
          description="Links are numbered title"
        />
      </label>
      <hr />

      {sortedLinks.map((link, index) => {
        const originalIndex = data.links.findIndex((l) => l.id === link.id);
        return (
          <Input
            {...link}
            key={link.id}
            number={index + 1}
            onChange={(values) =>
              dispatch(updateLink(originalIndex, { ...link, ...values }))
            }
            onMoveUp={
              data.sortBy === "none" && index !== 0
                ? () => dispatch(reorderLink(originalIndex, originalIndex - 1))
                : undefined
            }
            onMoveDown={
              data.sortBy === "none" && index !== data.links.length - 1
                ? () => dispatch(reorderLink(originalIndex, originalIndex + 1))
                : undefined
            }
            onRemove={() => dispatch(removeLink(originalIndex))}
            setCache={setCache}
          />
        );
      })}

      <p style={{ marginTop: "0.5rem" }}>
        <button
          className="button button--primary"
          onClick={() => dispatch(addLink())}
        >
          <FormattedMessage
            id="plugins.links.AddLink"
            defaultMessage="Add link"
            description="Add link title"
          />
        </button>
      </p>
    </div>
  );
};

export default LinksSettings;
