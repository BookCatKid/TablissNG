import React, { FC } from "react";
import { Props, defaultData } from "./types";

const TopSitesSettings: FC<Props> = ({ data = defaultData, setData }) => {
  if (!setData) return null;

  return (
    <div className="TopSitesSettings">
      <label>
        Number of columns
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
        <input
          type="checkbox"
          checked={data.linkOpenStyle}
          onChange={() =>
            setData({ ...data, linkOpenStyle: !data.linkOpenStyle })
          }
        />
        Links open in a new tab
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.linksNumbered}
          onChange={() =>
            setData({ ...data, linksNumbered: !data.linksNumbered })
          }
        />
        Links are numbered
      </label>

      <hr />

      <label>
        Icon Provider
        <select
          value={data.iconProvider}
          onChange={(event) =>
            setData({ ...data, iconProvider: event.target.value })
          }
        >
          <option value="_favicon_google">Google</option>
          <option value="_favicon_duckduckgo">DuckDuckGo</option>
          <option value="_favicon_favicone">Favicone</option>
        </select>
      </label>

      <label>
        Maximum Text Length
        <input
          type="number"
          min="0"
          value={data.maxTextLength}
          onChange={(event) =>
            setData({ ...data, maxTextLength: Number(event.target.value) })
          }
        />
      </label>
    </div>
  );
};

export default TopSitesSettings;
