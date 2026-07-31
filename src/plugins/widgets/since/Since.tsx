import "./Since.sass";

import { FC } from "react";
import {
  defineMessages,
  FormattedMessage,
  FormattedRelativeTime,
} from "react-intl";

import { useTime } from "../../../hooks";
import { defaultData, Props } from "./types";

const sinceMessages = defineMessages({
  defaultTitle: {
    id: "plugins.since.defaultTitle",
    defaultMessage: "Since",
    description: "Default title for Since widget",
  },
  was: {
    id: "plugins.since.was",
    defaultMessage: "was",
    description: "Past verb for Since widget",
  },
  willBe: {
    id: "plugins.since.willBe",
    defaultMessage: "will be",
    description: "Future verb for Since widget",
  },
});

const Since: FC<Props> = ({ data = defaultData }) => {
  const from = useTime().getTime();
  const to = data.time;
  const diff = ((to - from) / 1000) | 0;

  return (
    <div className="Since">
      <h3>
        {data.title || <FormattedMessage {...sinceMessages.defaultTitle} />}
        &nbsp;
        {diff > 0 ? (
          <FormattedMessage {...sinceMessages.willBe} />
        ) : (
          <FormattedMessage {...sinceMessages.was} />
        )}
        &nbsp;
        <span className={`Since relativeTime`}>
          <FormattedRelativeTime value={diff} updateIntervalInSeconds={1} />
        </span>
      </h3>
    </div>
  );
};

export default Since;
