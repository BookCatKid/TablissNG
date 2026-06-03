import { type FC, type MouseEvent, useMemo } from "react";
import { defineMessages, useIntl } from "react-intl";

import { isSpecialUrl, normalizeUrl } from "../../../utils";
import { CustomImage } from "./components/CustomImage";
import { CustomSvg } from "./components/CustomSvg";
import { Favicon } from "./components/Favicon";
import { IconifyIcon } from "./components/IconifyIcon";
import { Cache, Link } from "./types";

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

const getDomain = (url: string): string | null => {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};

type Props = Link & {
  number: number;
  linkOpenStyle: boolean;
  linksNumbered: boolean;
  cache?: Cache;
  onLinkClick?: () => void;
};

export const Display: FC<Props> = ({
  iconConfig,
  name,
  number,
  url,
  linkOpenStyle,
  linksNumbered,
  cache,
  customWidth,
  customHeight,
  conserveAspectRatio,
  keyboardShortcut,
  useExtensionTabs,
  onLinkClick,
}) => {
  const intl = useIntl();
  const normalizedUrl = useMemo(() => normalizeUrl(url), [url]);
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

  const domain = useMemo(() => getDomain(normalizedUrl), [normalizedUrl]);

  const displayWidth = customWidth || 24;
  const displayHeight = customHeight || 24;

  const handleClick = async (e: MouseEvent) => {
    if (
      BUILD_TARGET !== "web" &&
      (useExtensionTabs || isSpecialUrl(normalizedUrl))
    ) {
      e.preventDefault();

      if (BUILD_TARGET === "firefox" && isSpecialUrl(normalizedUrl)) {
        alert(
          "Sorry, Firefox restricts access to this type of URL. This is completely out of my control.",
        );
        return;
      }

      try {
        if (linkOpenStyle) {
          await browser.tabs.create({
            url: normalizedUrl,
            active: true,
          });
        } else {
          await browser.tabs.update({
            url: normalizedUrl,
          });
        }
      } catch (error) {
        console.error(error);
      }
    }

    onLinkClick?.();
  };

  const renderIcon = () => {
    if (!iconConfig) return null;

    switch (iconConfig.type) {
      case "favicon":
        return (
          <Favicon
            provider={iconConfig.provider}
            domain={domain}
            width={displayWidth}
            height={displayHeight}
            conserveAspectRatio={conserveAspectRatio}
            resolution={iconConfig.resolution}
          />
        );
      case "iconify":
        return (
          <IconifyIcon
            iconString={iconConfig.value}
            width={displayWidth}
            height={displayHeight}
            conserveAspectRatio={conserveAspectRatio}
          />
        );
      case "custom_svg":
      case "custom_upload": {
        const cachedItem = cache?.[iconConfig.cacheKey];
        if (!cachedItem) return null;

        if (cachedItem.type === "svg") {
          return (
            <CustomSvg
              svgString={cachedItem.data}
              width={displayWidth}
              height={displayHeight}
              conserveAspectRatio={conserveAspectRatio}
            />
          );
        }

        if (iconConfig.type === "custom_svg") {
          console.error(
            `Expected cached icon ${iconConfig.cacheKey} to be svg, but found ${cachedItem.type}. Icon will not render.`,
          );
          return null;
        }

        return (
          <CustomImage
            src={cachedItem.data}
            alt={name}
            width={displayWidth}
            height={displayHeight}
            conserveAspectRatio={conserveAspectRatio}
          />
        );
      }
      case "custom_image_url":
        return (
          <CustomImage
            src={iconConfig.url}
            alt={name}
            width={displayWidth}
            height={displayHeight}
            conserveAspectRatio={conserveAspectRatio}
          />
        );
      case "feather":
        return (
          <IconifyIcon
            iconString={iconConfig.value || "feather:bookmark"}
            width={displayWidth}
            height={displayHeight}
            conserveAspectRatio={conserveAspectRatio}
          />
        );
      default:
        return null;
    }
  };

  return (
    <a
      className={`Link ${linkOpenStyle ? "Link--open" : ""}`}
      href={normalizedUrl}
      onClick={handleClick}
      rel="noopener noreferrer"
      target={linkOpenStyle ? "_blank" : "_self"}
      title={title}
    >
      {linksNumbered ? <span className="LinkNumber">{number} </span> : null}
      {renderIcon()}
      <span className="Link-name">{name}</span>
    </a>
  );
};
