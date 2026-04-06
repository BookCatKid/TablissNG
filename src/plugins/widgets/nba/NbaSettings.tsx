import { FC } from "react";
import { FormattedMessage } from "react-intl";

import { defaultData, Props } from "./types";

const NbaSettings: FC<Props> = ({ data = defaultData, setData }) => (
  <div className="NbaSettings">
    <label>
      <input
        type="checkbox"
        checked={data.displayLogo}
        onChange={(event) =>
          setData({ ...data, displayLogo: event.target.checked })
        }
      />{" "}
      <FormattedMessage
        id="plugins.nba.displayTeamLogo"
        defaultMessage="Display team logo"
        description="Display team logo title"
      />
    </label>
  </div>
);

export default NbaSettings;
