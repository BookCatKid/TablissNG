import React, { FC, useMemo } from "react";
import { defineMessages, useIntl } from "react-intl";
import { Icon } from "@iconify/react";
import { Link, Cache } from "./types";

const displayUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.hostname + (parsed.pathname !== "/" ? parsed.pathname : "");
  } catch (e) {
    return url;
  }
};

const getDomain = (url: string): string | null => {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return null;
  }
};

const parseSvg = (svgString: string, width?: number, height?: number) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const svg = doc.querySelector("svg");
    if (!svg) return null;

    svg.setAttribute("width", `${width ?? 24}`);
    svg.setAttribute("height", `${height ?? 24}`);
    return <span dangerouslySetInnerHTML={{ __html: svg.outerHTML }} />;
  } catch {
    return null;
  }
};

const messages = defineMessages({
  shortcutHint: {
    id: "plugins.links.shortcutHint",
    description: "Hover hint text for links with a keyboard shortcut",
    defaultMessage: "Press {key} or click to visit",
  },
  standardHint: {
    id: "plugins.links.standardHint",
    description: "Hover hint text for links without a keyboard shortcut",
    defaultMessage: "Click to visit",
  },
});

type Props = Link & {
  number: number;
  linkOpenStyle: boolean;
  linksNumbered: boolean;
  cache?: Cache;
  onLinkClick?: () => void;
};

const Display: FC<Props> = ({
  icon,
  iconSize,
  IconString,
  IconStringIco,
  SvgString,
  name,
  number,
  url,
  linkOpenStyle,
  linksNumbered,
  iconifyIdentifier,
  iconifyValue,
  iconCacheKey,
  cache,
  customWidth,
  customHeight,
  conserveAspectRatio,
  keyboardShortcut,
  onLinkClick,
}) => {
  const intl = useIntl();
  const title = useMemo(() => {
    const fallback =
      typeof number !== "undefined" && number < 10 ? String(number) : undefined;
    const label =
      keyboardShortcut && keyboardShortcut.length > 0
        ? keyboardShortcut
        : fallback;
    if (label && label.length > 0)
      return intl.formatMessage(messages.shortcutHint, { key: label });
    return intl.formatMessage(messages.standardHint);
  }, [intl, number, keyboardShortcut]);
  const domain = useMemo(() => getDomain(url), [url]);
  const parsedSvg = useMemo(
    () => (SvgString ? parseSvg(SvgString, customWidth, customHeight) : null),
    [SvgString, customWidth, customHeight],
  );

  const handleClick = (e: React.MouseEvent) => {
    // Prevent default behavior for special URLs
    if (
      url.startsWith("about:") || // Browser internal pages (about:blank, about:config)
      url.startsWith("chrome:") || // Chrome browser internal pages (chrome:settings)
      url.startsWith("edge:") || // Edge browser internal pages (edge:settings)
      url.startsWith("file:") || // Local file system URLs (file:///path)
      url.startsWith("chrome-extension:") || // Chrome extension pages (chrome-extension://id)
      url.startsWith("moz-extension:") || // Firefox extension pages (moz-extension://id)
      url.startsWith("ms-settings:") || // Windows system settings (ms-settings:display)
      url.startsWith("view-source:")
    ) {
      // View page source (view-source:https://example.com)
      e.preventDefault();

      if (BUILD_TARGET === "firefox") {
        alert(
          "Sorry, Firefox restricts access to this type of URL. This is completely out of my control. Please copy and paste the URL into your address bar manually.",
        );
        return;
      }

      if (linkOpenStyle) {
        browser.tabs
          .create({
            url: url,
            active: true,
          })
          .catch(console.error);
      } else {
        browser.tabs
          .update({
            url: url,
          })
          .catch(console.error);
      }
    }

    onLinkClick?.();
  };

  return (
    <a
      className={`Link ${linkOpenStyle ? "Link--open" : ""}`}
      href={url}
      onClick={handleClick}
      rel="noopener noreferrer"
      target={linkOpenStyle ? "_blank" : "_self"}
      title={title}
    >
      {linksNumbered ? <span className="LinkNumber">{number} </span> : null}
      {icon === "_favicon_duckduckgo" && domain ? (
        <i>
          <img
            alt={domain}
            src={`https://icons.duckduckgo.com/ip3/${domain}.ico`}
          />
        </i>
      ) : (icon === "_favicon_google" && domain) ||
        (icon === "_favicon" && domain) ? (
        <i>
          <img
            alt={domain}
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=${iconSize ?? 256}`}
          />
        </i>
      ) : icon === "_favicon_favicone" && domain ? (
        <i>
          <img
            alt={domain}
            src={`https://favicone.com/${domain}?s=${iconSize ?? 256}`}
          />
        </i>
      ) : icon === "_custom_iconify" && IconString ? (
        <i>
          <Icon icon={IconString} width={customWidth} height={customWidth} />
        </i>
      ) : icon === "_custom_svg" && parsedSvg ? (
        <span className="custom-icon">{parsedSvg}</span>
      ) : icon === "_custom_ico" && IconStringIco ? (
        <i>
          <img
            src={IconStringIco}
            alt={name}
            style={{
              width: conserveAspectRatio
                ? `${customWidth}px`
                : `${customWidth}px`,
              height: conserveAspectRatio ? "auto" : `${customHeight}px`,
              display: "inline-block",
            }}
          />
        </i>
      ) : icon === "_custom_upload" && iconCacheKey && cache?.[iconCacheKey] ? (
        <i className="custom-icon">
          {cache[iconCacheKey].type === "svg" ? (
            parseSvg(cache[iconCacheKey].data, customWidth, customHeight)
          ) : (
            <img
              alt={name}
              src={cache[iconCacheKey].data}
              style={{
                width: conserveAspectRatio
                  ? `${customWidth}px`
                  : `${customWidth}px`,
                height: conserveAspectRatio ? "auto" : `${customHeight}px`,
                display: "inline-block",
              }}
            />
          )}
        </i>
      ) : icon === "_feather" ? (
        <i>
          <Icon
            icon={
              iconifyValue
                ? iconifyIdentifier + iconifyValue
                : "feather:bookmark"
            }
            width={customWidth}
            height={customHeight}
          />
        </i>
      ) : icon ? (
        <i>
          <Icon icon={"feather:" + icon} />
        </i>
      ) : null}
      {name}
    </a>
  );
};

export default Display;
