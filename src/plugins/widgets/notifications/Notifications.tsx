import React from "react";
import {
  fetchSETokens,
  fetchWikiTokens,
  fetchSEInbox,
  fetchWikiInbox,
  dummyTokens,
  dummyInbox,
} from "./api";
import PopoverIcon from "./PopoverIcon";
import "./Notifications.sass";
import { defaultData, Props } from "./types";

const Notifications = ({ cache, data = defaultData, setCache }: Props) => {
  return (
    <div className="notification-wrapper">
      {data.showSE && (
        <PopoverIcon
          icon="https://www.google.com/s2/favicons?domain=stackexchange.com&sz=256"
          accessTokenKey="se_token"
          fetchToken={fetchSETokens}
          fetchInbox={fetchSEInbox}
        />
      )}
      {data.showWiki && (
        <PopoverIcon
          icon="https://www.google.com/s2/favicons?domain=wikipedia.org&sz=256"
          accessTokenKey="wiki_token"
          fetchToken={fetchWikiTokens}
          fetchInbox={fetchWikiInbox}
        />
      )}

      {/* not implemented yet */}
      <>
        {data.showSlack && (
          <PopoverIcon
            icon="https://www.google.com/s2/favicons?domain=slack.com&sz=256"
            accessTokenKey={"slack_token"}
            fetchToken={dummyTokens}
            fetchInbox={dummyInbox}
          />
        )}
        {data.showGithub && (
          <PopoverIcon
            icon="https://github.githubassets.com/favicons/favicon.svg"
            accessTokenKey={"github_token"}
            fetchToken={dummyTokens}
            fetchInbox={dummyInbox}
          />
        )}
        {data.showReddit && (
          <PopoverIcon
            icon="https://www.google.com/s2/favicons?domain=reddit.com&sz=256"
            accessTokenKey={"reddit_token"}
            fetchToken={dummyTokens}
            fetchInbox={dummyInbox}
          />
        )}
        {data.showDiscord && (
          <PopoverIcon
            icon="https://www.google.com/s2/favicons?domain=discord.com&sz=256"
            accessTokenKey={"discord_token"}
            fetchToken={dummyTokens}
            fetchInbox={dummyInbox}
          />
        )}
      </>
    </div>
  );
};

export default Notifications;
