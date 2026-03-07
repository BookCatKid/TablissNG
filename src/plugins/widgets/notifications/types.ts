import { ReactNode } from "react";
import { API } from "../../types";

export type Props = API<Data>;

export type Data = {
  showWiki: boolean;
  showSE: boolean;
  showSlack: boolean;
  showGithub: boolean;
  showReddit: boolean;
  showDiscord: boolean;
};

export const defaultData: Data = {
  showWiki: true,
  showSE: true,
  showSlack: true,
  showGithub: true,
  showReddit: true,
  showDiscord: true,
};

export type InboxItem = {
  link: string;
  msg: string;
  time: number;
};

export type Inbox = InboxItem[] | null;

export type UseInboxParams = {
  fetchToken: () => Promise<{ access_token: string | null }>;
  fetchInbox: (token: string) => Promise<Inbox>;
  accessTokenKey: string;
};

export type PopoverIconProps = UseInboxParams & { icon: string };

export type IconBadgeProps = {
  count?: number;
  icon: string;
};

export type SEApiResponse = {
  items: Array<{
    link: string;
    title: string;
    creation_date: number;
  }>;
};

export type WikiApiResponse = {
  query: {
    notifications: {
      list: Array<{
        revid?: number;
        title: { full: string };
        type: string;
        timestamp: { utcunix: number };
      }>;
    };
  };
};
