import React, { FC, useMemo } from "react";
import { useIntl } from "react-intl";
import { Link, Cache } from "./types";
import { isSpecialUrl, normalizeUrl } from "../../../utils";
import { Favicon } from "./components/Favicon";
import { CustomSvg } from "./components/CustomSvg";
import { CustomImage } from "./components/CustomImage";
import { IconifyIcon } from "./components/IconifyIcon";

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
  icon,
  iconSize,
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
      return intl.formatMessage(
        {
          id: "plugins.links.shortcutHint",
          description: "Hover hint text for links with a keyboard shortcut",
          defaultMessage: "Press {key} or click to visit",
        },
        { key: label },
      );
    return intl.formatMessage({
      id: "plugins.links.standardHint",
      description: "Hover hint text for links without a keyboard shortcut",
      defaultMessage: "Click to visit",
    });
  }, [intl, number, keyboardShortcut]);

  const domain = useMemo(() => getDomain(normalizedUrl), [normalizedUrl]);

  const displayWidth = customWidth || 24;
  const displayHeight = customHeight || 24;

  const handleClick = async (e: React.MouseEvent) => {
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
    if (
      icon === "_favicon_duckduckgo" ||
      icon === "_favicon_google" ||
      icon === "_favicon" ||
      icon === "_favicon_favicone"
    ) {
      return (
        <Favicon
          icon={icon}
          domain={domain}
          width={displayWidth}
          height={displayHeight}
          conserveAspectRatio={conserveAspectRatio}
          resolution={iconSize}
        />
      );
    }

    if (icon === "_custom_iconify" && iconifyValue) {
      return (
        <IconifyIcon
          iconString={
            iconifyIdentifier ? iconifyIdentifier + iconifyValue : iconifyValue
          }
          width={displayWidth}
          height={displayHeight}
          conserveAspectRatio={conserveAspectRatio}
        />
      );
    }

    if (
      (icon === "_custom_svg" || icon === "_custom_upload") &&
      iconCacheKey &&
      cache?.[iconCacheKey]
    ) {
      const cachedItem = cache[iconCacheKey];
      if (cachedItem.type === "svg") {
        return (
          <CustomSvg
            svgString={cachedItem.data}
            width={displayWidth}
            height={displayHeight}
            conserveAspectRatio={conserveAspectRatio}
          />
        );
      } else {
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
    }

    if (icon === "_custom_ico" && iconCacheKey && cache?.[iconCacheKey]) {
      return (
        <CustomImage
          src={cache[iconCacheKey].data}
          alt={name}
          width={displayWidth}
          height={displayHeight}
          conserveAspectRatio={conserveAspectRatio}
        />
      );
    }

    if (icon === "_feather") {
      return (
        <IconifyIcon
          iconString={
            iconifyValue
              ? (iconifyIdentifier || "feather:") + iconifyValue
              : "feather:bookmark"
          }
          width={displayWidth}
          height={displayHeight}
          conserveAspectRatio={conserveAspectRatio}
        />
      );
    }

    if (icon) {
      // Legacy fallback for simple icon names (feather)
      return (
        <IconifyIcon
          iconString={"feather:" + icon}
          width={displayWidth}
          height={displayHeight}
          conserveAspectRatio={conserveAspectRatio}
        />
      );
    }

    return null;
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

export default Display;
