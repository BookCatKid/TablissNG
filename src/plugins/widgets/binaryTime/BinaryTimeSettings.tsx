import { FC } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { pluginMessages } from "../../../locales/messages";
import TimeZoneInput from "../../../views/shared/timeZone/TimeZoneInput";
import { defaultData, Props } from "./types";

const BinaryTimeSettings: FC<Props> = ({ data = defaultData, setData }) => {
  const intl = useIntl();

  return (
    <div className="TimeSettings">
      <label>
        <FormattedMessage {...pluginMessages.yourName} />
        <input
          type="text"
          value={data.name}
          placeholder={intl.formatMessage(pluginMessages.namePlaceholder)}
          onChange={(event) => setData({ ...data, name: event.target.value })}
        />
      </label>

      <label>
        <FormattedMessage {...pluginMessages.timeZone} />
        <TimeZoneInput
          timeZone={data.timeZone}
          onChange={(timeZone) => setData({ ...data, timeZone })}
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.showSeconds}
          onChange={(event) =>
            setData({ ...data, showSeconds: event.target.checked })
          }
        />{" "}
        <FormattedMessage
          id="plugins.binaryTime.showSeconds"
          defaultMessage="Display seconds"
          description="Label for show seconds checkbox"
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.showMinutes}
          onChange={(event) =>
            setData({ ...data, showMinutes: event.target.checked })
          }
        />{" "}
        <FormattedMessage
          id="plugins.binaryTime.showMinutes"
          defaultMessage="Display minutes"
          description="Label for show minutes checkbox"
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.showHours}
          onChange={(event) =>
            setData({ ...data, showHours: event.target.checked })
          }
        />{" "}
        <FormattedMessage
          id="plugins.binaryTime.showHours"
          defaultMessage="Display hours"
          description="Label for show hours checkbox"
        />
      </label>

      <label>
        <FormattedMessage
          id="plugins.binaryTime.activeColor"
          defaultMessage="Active Color"
          description="Label for active color picker"
        />
        <input
          type="color"
          value={data.onColor}
          onChange={(event) =>
            setData({ ...data, onColor: event.target.value })
          }
        />
      </label>

      <label>
        <FormattedMessage
          id="plugins.binaryTime.inactiveColor"
          defaultMessage="Inactive Color"
          description="Label for inactive color picker"
        />
        <input
          type="color"
          value={data.offColor}
          onChange={(event) =>
            setData({ ...data, offColor: event.target.value })
          }
        />
      </label>
    </div>
  );
};

export default BinaryTimeSettings;
