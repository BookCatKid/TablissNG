import React, { FC, useEffect, useState } from "react";
import { defaultData, Props, Data } from "./types";
import { BookmarkTreeNode } from "./types";

const BookmarksSettings: FC<Props> = ({ data = defaultData, setData }) => {
  const [tree, setTree] = useState<BookmarkTreeNode>();
  const [hasPermission, setHasPermission] = useState<boolean>(true);

  useEffect(() => {
    const checkPermission = async () => {
      const granted = await browser.permissions.contains({
        permissions: ["bookmarks"],
      });
      setHasPermission(granted);
      if (granted) {
        const treeData = await browser.bookmarks.getTree();
        setTree(treeData[0]);
      }
    };
    checkPermission();
  }, []);

  if (!hasPermission) {
    return (
      <div className="BookmarksSettings">
        <p>Please enable the bookmarks permission in the widget first.</p>
      </div>
    );
  }

  const items: React.JSX.Element[] = [];

  const descendTree = (tree: BookmarkTreeNode | undefined, pad: string) => {
    if (!tree || tree.url) {
      return;
    }

    items.push(
      <option
        key={tree.id}
        value={tree.id}
        selected={tree.id === data.rootBookmark}
        dangerouslySetInnerHTML={{
          __html: pad + (tree.title || tree.id),
        }}
      />,
    );

    if (tree.children) {
      for (const item of tree.children) {
        descendTree(item, pad + "&nbsp;&nbsp;&nbsp;");
      }
    }
  };

  descendTree(tree, "");

  return (
    <div className="BookmarksSettings">
      <label>
        Root bookmark folder
        <select
          onChange={(evt) =>
            setData({ ...data, rootBookmark: evt.target.value })
          }
        >
          {items}
        </select>
      </label>

      <label>
        Navigation style
        <select
          value={data.navigationStyle}
          onChange={(evt) =>
            setData({
              ...data,
              navigationStyle: evt.target.value as
                | "drill-down"
                | "expand-collapse"
                | "auto-expanded"
                | "quick-links",
            })
          }
        >
          <option value="drill-down">Drill-down navigation</option>
          <option value="expand-collapse">Expandable folders</option>
          <option value="auto-expanded">Auto-expanded tree</option>
          <option value="quick-links">Quick links style</option>
        </select>
      </label>

      {data.navigationStyle === "quick-links" && (
        <label>
          Columns
          <input
            type="number"
            min="1"
            max="10"
            value={data.columns || 1}
            onChange={(evt) =>
              setData({ ...data, columns: parseInt(evt.target.value, 10) })
            }
          />
        </label>
      )}

      {data.navigationStyle === "expand-collapse" && (
        <label>
          <input
            type="checkbox"
            checked={data.rememberExpanded ?? true}
            onChange={(e) =>
              setData({ ...data, rememberExpanded: e.target.checked })
            }
          />
          Remember expanded folders
        </label>
      )}

      <label>
        Maximum width (em)
        <input
          type="number"
          value={data.maxWidth}
          onChange={(event) =>
            setData({ ...data, maxWidth: Number(event.target.value) })
          }
          min={1}
        />
      </label>

      <label>
        Maximum height (em)
        <input
          type="number"
          value={data.maxHeight}
          onChange={(event) =>
            setData({ ...data, maxHeight: Number(event.target.value) })
          }
          min={1}
        />
      </label>

      <label>
        Icon Size (px)
        <input
          type="number"
          value={data.iconSize ?? 24}
          onChange={(event) =>
            setData({ ...data, iconSize: Number(event.target.value) })
          }
          min={1}
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.wrap}
          onChange={(event) => setData({ ...data, wrap: !data.wrap })}
        />
        Wrap long titles
      </label>

      <hr />

      <label>
        Icon Provider
        <select
          value={data.iconProvider}
          onChange={(event) =>
            setData({
              ...data,
              iconProvider: event.target.value as Data["iconProvider"],
            })
          }
        >
          <option value="_default">Default</option>
          <optgroup label="Website Icons">
            <option value="_favicon_google">Google</option>
            <option value="_favicon_duckduckgo">DuckDuckGo</option>
            <option value="_favicon_favicone">Favicone</option>
          </optgroup>
        </select>
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.shortNames}
          onChange={(event) =>
            setData({ ...data, shortNames: event.target.checked })
          }
        />
        Use short names
      </label>

      {data.navigationStyle === "quick-links" && (
        <label>
          <input
            type="checkbox"
            checked={data.showNameUnderIcon}
            onChange={(event) =>
              setData({ ...data, showNameUnderIcon: event.target.checked })
            }
          />
          Show name under icon
        </label>
      )}

      <label>
        Maximum Text Length (Use -1 to hide, 0 for no limit)
        <input
          type="number"
          min="-1"
          value={data.maxTextLength ?? 0}
          onChange={(event) =>
            setData({ ...data, maxTextLength: Number(event.target.value) })
          }
        />
      </label>
    </div>
  );
};

export default BookmarksSettings;
