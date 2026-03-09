import React from "react";
import { Icon } from "@iconify/react";
import { FormattedMessage, useIntl } from "react-intl";
import { API } from "../../types";
import { Data, defaultData } from "./types";
import { messages } from "./messages";
import "./TallyCounter.sass";

const TallyCounter: React.FC<API<Data>> = ({ data = defaultData, setData }) => {
  const intl = useIntl();

  const increment = () => {
    setData({ ...data, count: data.count + (data.step ?? 1) });
  };

  const decrement = () => {
    setData({ ...data, count: data.count - (data.step ?? 1) });
  };

  const reset = () => {
    setData({ ...data, count: 0 });
  };

  return (
    <div className="TallyCounter">
      {data.label && <div className="label">{data.label}</div>}
      <div className="count-container">
        <button
          className="button button--primary control-btn"
          onClick={decrement}
          title={intl.formatMessage(messages.decrement)}
        >
          <Icon icon="feather:minus" />
        </button>
        <span className="count">{data.count}</span>
        <button
          className="button button--primary control-btn"
          onClick={increment}
          title={intl.formatMessage(messages.increment)}
        >
          <Icon icon="feather:plus" />
        </button>
      </div>
      {data.showReset && (
        <button className="button button--primary reset-btn" onClick={reset}>
          <Icon icon="feather:rotate-ccw" />
          <span>
            <FormattedMessage {...messages.reset} />
          </span>
        </button>
      )}
    </div>
  );
};

export default TallyCounter;
