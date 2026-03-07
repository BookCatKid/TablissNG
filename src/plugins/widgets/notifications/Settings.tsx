import React, { FC } from "react";
import { FormattedMessage } from "react-intl";
import { Props, defaultData } from "./types";

const NotificationsSettings: FC<Props> = ({ data = defaultData, setData }) => {
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={data.showSE}
          onChange={() => setData({ ...data, showSE: !data.showSE })}
        />{" "}
        <FormattedMessage
          id="plugins.notifications.showSE"
          defaultMessage="Show Stack Exchange"
          description="Show Stack Exchange notifications checkbox label"
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={data.showWiki}
          onChange={() => setData({ ...data, showWiki: !data.showWiki })}
        />{" "}
        <FormattedMessage
          id="plugins.notifications.showWiki"
          defaultMessage="Show Wikipedia"
          description="Show Wikipedia notifications checkbox label"
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={data.showSlack}
          onChange={() => setData({ ...data, showSlack: !data.showSlack })}
        />{" "}
        <FormattedMessage
          id="plugins.notifications.showSlack"
          defaultMessage="Show Slack"
          description="Show Slack notifications checkbox label"
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={data.showGithub}
          onChange={() => setData({ ...data, showGithub: !data.showGithub })}
        />{" "}
        <FormattedMessage
          id="plugins.notifications.showGithub"
          defaultMessage="Show Git notifications"
          description="Show GitHub notifications checkbox label"
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={data.showReddit}
          onChange={() => setData({ ...data, showReddit: !data.showReddit })}
        />{" "}
        <FormattedMessage
          id="plugins.notifications.showReddit"
          defaultMessage="Show Reddit"
          description="Show Reddit notifications checkbox label"
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={data.showDiscord}
          onChange={() => setData({ ...data, showDiscord: !data.showDiscord })}
        />{" "}
        <FormattedMessage
          id="plugins.notifications.showDiscord"
          defaultMessage="Show Discord"
          description="Show Discord notifications checkbox label"
        />
      </label>
    </div>
  );
};

export default NotificationsSettings;
