import React from "react";
import { FormattedMessage } from "react-intl";
import { defaultData, Props } from "./types";

const IpInfoSettings: React.FC<Props> = ({ data = defaultData, setData }) => (
  <div className="IpInfoSettings">
    <label>
      <input
        type="checkbox"
        checked={data.displayCity}
        onChange={() => setData({ ...data, displayCity: !data.displayCity })}
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
        onChange={() =>
          setData({ ...data, displayCountry: !data.displayCountry })
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
        onChange={() => setData({ ...data, hideIP: !data.hideIP })}
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
        onChange={() => setData({ ...data, maskIP: !data.maskIP })}
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
        onChange={() =>
          setData({ ...data, clickToRefresh: !data.clickToRefresh })
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
