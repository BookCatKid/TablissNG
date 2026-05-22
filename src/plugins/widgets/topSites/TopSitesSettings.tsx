import { FC } from "react";
import { FormattedMessage } from "react-intl";

import { defaultData, Props } from "./types";

const TopSitesSettings: FC<Props> = ({ data = defaultData, setData }) => {
  if (!setData) return null;

  return (
    <div className="TopSitesSettings">
      <label>
        <FormattedMessage
          id="plugins.topSites.columns"
          defaultMessage="Number of columns"
          description="Label for the number of columns input in Top Sites settings"
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
        <input
          type="checkbox"
          checked={data.linkOpenStyle}
          onChange={() =>
            setData({ ...data, linkOpenStyle: !data.linkOpenStyle })
          }
        />
        <FormattedMessage
          id="plugins.topSites.newTab"
          defaultMessage="Links open in a new tab"
          description="Label for the toggle that makes links open in a new tab"
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
          id="plugins.topSites.numbered"
          defaultMessage="Links are numbered"
          description="Label for the toggle that displays numbers next to links"
        />
      </label>

      <hr />

      <label>
        <FormattedMessage
          id="plugins.topSites.iconProvider"
          defaultMessage="Icon Provider"
          description="Label for the icon provider select input"
        />
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
        <FormattedMessage
          id="plugins.topSites.maxTextLength"
          defaultMessage="Maximum Text Length"
          description="Label for the maximum text length input"
        />
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
