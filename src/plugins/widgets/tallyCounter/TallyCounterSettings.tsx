import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { API } from "../../types";
import { Data, defaultData } from "./types";
import { messages } from "./messages";
import { pluginMessages } from "../../../locales/messages";

const TallyCounterSettings: React.FC<API<Data>> = ({
  data = defaultData,
  setData,
}) => {
  const intl = useIntl();
  const [tempCount, setTempCount] = useState(data.count);

  const handleApply = () => {
    setData({ ...data, count: tempCount });
  };

  return (
    <div className="TallyCounterSettings">
      <label>
        <FormattedMessage {...messages.label} />
        <input
          type="text"
          value={data.label}
          onChange={(event) => setData({ ...data, label: event.target.value })}
          placeholder={intl.formatMessage(messages.labelPlaceholder)}
        />
      </label>

      <label>
        <FormattedMessage {...messages.step} />
        <input
          type="number"
          value={data.step}
          onChange={(event) =>
            setData({ ...data, step: parseFloat(event.target.value) })
          }
        />
      </label>

      <label>
        <FormattedMessage {...messages.setCount} />
        <input
          type="number"
          value={tempCount}
          onChange={(event) => setTempCount(parseFloat(event.target.value))}
        />
        <button onClick={handleApply} className="button button--primary">
          <FormattedMessage {...pluginMessages.apply} />
        </button>
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.showReset}
          onChange={(event) =>
            setData({ ...data, showReset: event.target.checked })
          }
        />{" "}
        <FormattedMessage {...messages.showReset} />
      </label>
    </div>
  );
};

export default TallyCounterSettings;
