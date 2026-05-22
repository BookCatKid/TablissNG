import type { FC } from "react";
import { FormattedMessage } from "react-intl";

import { defaultData, Props } from "./types";

const IpInfoSettings: FC<Props> = ({ data = defaultData, setData }) => (
  <div className="IpInfoSettings">
    <label>
      <input
        type="checkbox"
        checked={data.displayCity}
        onChange={(event) =>
          setData({ ...data, displayCity: event.target.checked })
        }
      />
      <FormattedMessage
        id="plugins.ipInfo.displayCity"
        defaultMessage="Display City"
        description="Display City title"
      />
    </label>

    <label>
      <input
        type="checkbox"
        checked={data.displayCountry}
        onChange={(event) =>
          setData({ ...data, displayCountry: event.target.checked })
        }
      />
      <FormattedMessage
        id="plugins.ipInfo.displayCountry"
        defaultMessage="Display Country"
        description="Display Country title"
      />
    </label>

    <label>
      <input
        type="checkbox"
        checked={data.hideIP}
        onChange={(event) => setData({ ...data, hideIP: event.target.checked })}
      />{" "}
      <FormattedMessage
        id="plugins.ipInfo.hideIP"
        defaultMessage="Hide IP"
        description="Option to hide IP address"
      />
    </label>

    <label>
      <input
        type="checkbox"
        checked={data.maskIP}
        onChange={(event) => setData({ ...data, maskIP: event.target.checked })}
      />{" "}
      <FormattedMessage
        id="plugins.ipInfo.maskIP"
        defaultMessage="Mask IP"
        description="Option to mask IP address"
      />
    </label>

    <label>
      <input
        type="checkbox"
        checked={data.clickToRefresh}
        onChange={(event) =>
          setData({ ...data, clickToRefresh: event.target.checked })
        }
      />{" "}
      <FormattedMessage
        id="plugins.ipInfo.clickToRefresh"
        defaultMessage="Enable Click to Refresh"
        description="Option to enable click to refresh functionality"
      />
    </label>
  </div>
);

export default IpInfoSettings;
