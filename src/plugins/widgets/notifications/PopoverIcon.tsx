import clsx from "clsx";
import React from "react";
import { formattedTime } from "../../../utils";
import { Popover, PopoverContent, PopoverTrigger } from "../../shared";
import { useInbox } from "./hooks";
import { IconBadgeProps, PopoverIconProps } from "./types";

const PopoverIcon = ({
  icon,
  fetchToken,
  accessTokenKey,
  fetchInbox,
}: PopoverIconProps) => {
  const { authenticate, inbox, loading } = useInbox({
    fetchToken,
    fetchInbox,
    accessTokenKey,
  });

  // Don't show badge when loading or inbox is empty
  if (loading || inbox?.length === 0) {
    return <IconBadge icon={icon} />;
  }

  // Prompt the user to log in when signed out
  if (inbox == null) {
    return (
      <div
        onClick={authenticate}
        title="Login required"
        className="is-disabled"
      >
        <IconBadge icon={icon} />
      </div>
    );
  }

  // Show the popover when there are unread messages
  return (
    <Popover>
      <PopoverTrigger>
        <IconBadge icon={icon} count={inbox.length} />
      </PopoverTrigger>
      <PopoverContent>
        <div className="notification-list">
          {inbox.map(({ msg, time, link }) => (
            <div key={msg + time} className="notification-item">
              <a
                className="notification-link"
                href={link}
                target="_blank"
                rel="noreferrer"
              >
                {msg}
              </a>
              <div className="notification-time">{formattedTime(time)}</div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const IconBadge = ({ count, icon }: IconBadgeProps) => {
  return (
    <div className={"badge-container"}>
      <div className={clsx("badge-button", { "circle-topright": count })}>
        <img src={icon} className="badge-icon" />
      </div>
      {count && <span className="badge-dot">{count}</span>}
    </div>
  );
};

export default PopoverIcon;
