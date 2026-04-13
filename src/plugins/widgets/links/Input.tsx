import "./Input.sass";

import { Icon } from "@iconify/react";
import type { ChangeEvent } from "react";
import { FC, useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";

import { normalizeUrl } from "../../../utils";
import {
  DownIcon,
  IconButton,
  RemoveIcon,
  UpIcon,
} from "../../../views/shared";
import { IconPickerModal } from "./components/IconPickerModal";
import { SizeInputs } from "./components/SizeInputs";
import { Cache, FaviconConfig, IconCacheItem, IconConfig, Link } from "./types";

const messages = defineMessages({
  removeLink: {
    id: "plugins.links.input.removeLink",
    defaultMessage: "Remove link",
  },
  moveDown: {
    id: "plugins.links.input.moveDown",
    defaultMessage: "Move link down",
  },
  moveUp: {
    id: "plugins.links.input.moveUp",
    defaultMessage: "Move link up",
  },
  websiteIcons: {
    id: "plugins.links.input.websiteIcons",
    defaultMessage: "Website Icons",
  },
  custom: {
    id: "plugins.links.input.custom",
    defaultMessage: "Custom",
  },
  iconifyIcons: {
    id: "plugins.links.input.iconifyIcons",
    defaultMessage: "Iconify Icons",
  },
  useExtensionTabsHelp: {
    id: "plugins.links.input.useExtensionTabsHelp",
    defaultMessage:
      "When enabled, links open through the browser extension API instead of the default browser behavior. Useful for restricted URLs like file://, about:, or browser settings. Some URLs will always open through the extension API regardless of this setting.",
  },
});

type Props = Link & {
  number: number;
  onChange: (values: Partial<Link>) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove: () => void;
  cache?: Cache;
  setCache: (cache: Cache) => void;
};

type IconSelectValue =
  | ""
  | "favicon_google"
  | "favicon_duckduckgo"
  | "favicon_favicone"
  | "iconify"
  | "custom_svg"
  | "custom_image_url"
  | "custom_upload"
  | "feather";

const getIconSelectValue = (iconConfig?: IconConfig): IconSelectValue => {
  if (!iconConfig) return "";
  if (iconConfig.type === "favicon")
    return `favicon_${iconConfig.provider}` as const;
  return iconConfig.type;
};

const getDefaultIconConfig = (
  value: IconSelectValue,
): IconConfig | undefined => {
  switch (value) {
    case "favicon_google":
      return { type: "favicon", provider: "google" };
    case "favicon_duckduckgo":
      return { type: "favicon", provider: "duckduckgo" };
    case "favicon_favicone":
      return { type: "favicon", provider: "favicone" };
    case "iconify":
      return { type: "iconify", value: "" };
    case "custom_svg":
      return { type: "custom_svg", cacheKey: `icon_svg_${Date.now()}` };
    case "custom_image_url":
      return { type: "custom_image_url", url: "" };
    case "custom_upload":
      return { type: "custom_upload", cacheKey: "" };
    case "feather":
      return { type: "feather", value: "feather:bookmark" };
    default:
      return undefined;
  }
};

const Input: FC<Props> = (props) => {
  const [urlValue, setUrlValue] = useState(props.url);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const intl = useIntl();

  const iconSelectValue = getIconSelectValue(props.iconConfig);
  const isFavicon = props.iconConfig?.type === "favicon";
  const isCustomUpload = props.iconConfig?.type === "custom_upload";
  const isFeather = props.iconConfig?.type === "feather";

  const removeCacheKey = (
    cache: Cache | undefined,
    cacheKey?: string,
  ): Cache => {
    if (!cache || !cacheKey || !cache[cacheKey]) return cache || {};
    const nextCache = { ...cache };
    delete nextCache[cacheKey];
    return nextCache;
  };

  const setIconConfig = (newConfig?: IconConfig) => {
    const oldConfig = props.iconConfig;
    const oldKey =
      oldConfig?.type === "custom_svg" || oldConfig?.type === "custom_upload"
        ? oldConfig.cacheKey
        : undefined;

    if (
      oldKey &&
      props.cache?.[oldKey] &&
      oldConfig?.type !== newConfig?.type
    ) {
      props.setCache(removeCacheKey(props.cache, oldKey));
    }

    props.onChange({ iconConfig: newConfig });
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleIconSelect = (iconString: string) => {
    if (props.iconConfig?.type === "feather") {
      setIconConfig({
        ...props.iconConfig,
        value: iconString,
      });
    }
    setIsModalOpen(false);
  };

  const handleIconTypeChange = (value: IconSelectValue) => {
    setIconConfig(getDefaultIconConfig(value));
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        let iconData: IconCacheItem;
        if (file.type === "image/svg+xml") {
          iconData = { data: result, type: "svg" };
        } else if (file.type === "image/x-icon") {
          iconData = { data: result, type: "ico" };
        } else {
          iconData = { data: result, type: "image" };
        }

        const oldKey =
          props.iconConfig?.type === "custom_svg" ||
          props.iconConfig?.type === "custom_upload"
            ? props.iconConfig.cacheKey
            : undefined;
        const cacheKey = `icon_${Date.now()}`;
        const baseCache = oldKey
          ? removeCacheKey(props.cache, oldKey)
          : props.cache;
        props.setCache({ ...baseCache, [cacheKey]: iconData });
        setIconConfig({ type: "custom_upload", cacheKey });
      }
    };

    if (file.type === "image/svg+xml") {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const faviconConfig =
    props.iconConfig?.type === "favicon" ? props.iconConfig : undefined;
  const iconifyConfig =
    props.iconConfig?.type === "iconify" ? props.iconConfig : undefined;
  const customSvgConfig =
    props.iconConfig?.type === "custom_svg" ? props.iconConfig : undefined;
  const customImageUrlConfig =
    props.iconConfig?.type === "custom_image_url"
      ? props.iconConfig
      : undefined;
  const customSvgValue =
    (customSvgConfig && props.cache?.[customSvgConfig.cacheKey]?.data) || "";
  const featherValue =
    props.iconConfig?.type === "feather" ? props.iconConfig.value : "";

  return (
    <div className="LinkInput">
      <h5>
        <div className="title--buttons">
          <IconButton
            onClick={props.onRemove}
            title={intl.formatMessage(messages.removeLink)}
          >
            <RemoveIcon />
          </IconButton>
          {props.onMoveDown && (
            <IconButton
              onClick={props.onMoveDown}
              title={intl.formatMessage(messages.moveDown)}
            >
              <DownIcon />
            </IconButton>
          )}
          {props.onMoveUp && (
            <IconButton
              onClick={props.onMoveUp}
              title={intl.formatMessage(messages.moveUp)}
            >
              <UpIcon />
            </IconButton>
          )}
        </div>

        {props.number <= 9 ? (
          <FormattedMessage
            id="plugins.links.input.keyboardShortcut"
            defaultMessage="Keyboard shortcut {number}"
            values={{ number: props.number }}
          />
        ) : (
          <FormattedMessage
            id="plugins.links.input.shortcut"
            defaultMessage="Shortcut"
          />
        )}
      </h5>

      <label>
        <FormattedMessage id="plugins.links.input.url" defaultMessage="URL" />
        <input
          type="url"
          value={urlValue}
          onChange={(e) => setUrlValue(e.target.value)}
          onBlur={() => {
            const normalized = normalizeUrl(urlValue);
            setUrlValue(normalized);
            props.onChange({ url: normalized });
          }}
        />
      </label>

      <label>
        <FormattedMessage id="plugins.links.input.name" defaultMessage="Name" />{" "}
        <span className="text--grey">
          (
          <FormattedMessage
            id="plugins.links.input.optional"
            defaultMessage="optional"
          />
          )
        </span>
        <input
          type="text"
          value={props.name}
          onChange={(event) => props.onChange({ name: event.target.value })}
        />
      </label>

      <label>
        <FormattedMessage id="plugins.links.input.icon" defaultMessage="Icon" />{" "}
        <span className="text--grey">
          (
          <FormattedMessage
            id="plugins.links.input.optional"
            defaultMessage="optional"
          />
          )
        </span>
        <select
          value={iconSelectValue}
          onChange={(event) =>
            handleIconTypeChange(event.target.value as IconSelectValue)
          }
        >
          <option value="">
            <FormattedMessage
              id="plugins.links.input.none"
              defaultMessage="None"
            />
          </option>
          <optgroup label={intl.formatMessage(messages.websiteIcons)}>
            <option value="favicon_google">
              <FormattedMessage
                id="plugins.links.input.fromGoogle"
                defaultMessage="From Google"
              />
            </option>
            <option value="favicon_duckduckgo">
              <FormattedMessage
                id="plugins.links.input.fromDuckDuckGo"
                defaultMessage="From DuckDuckGo"
              />
            </option>
            <option value="favicon_favicone">
              <FormattedMessage
                id="plugins.links.input.fromFavicone"
                defaultMessage="From Favicone"
              />
            </option>
          </optgroup>
          <optgroup label={intl.formatMessage(messages.custom)}>
            <option value="iconify">
              <FormattedMessage
                id="plugins.links.input.fromIconify"
                defaultMessage="From Iconify"
              />
            </option>
            <option value="custom_svg">
              <FormattedMessage
                id="plugins.links.input.customSvgHtml"
                defaultMessage="Custom SVG HTML"
              />
            </option>
            <option value="custom_image_url">
              <FormattedMessage
                id="plugins.links.input.customImageUrl"
                defaultMessage="Custom Image URL"
              />
            </option>
            <option value="custom_upload">
              <FormattedMessage
                id="plugins.links.input.uploadCustomIcon"
                defaultMessage="Upload Custom Icon"
              />
            </option>
          </optgroup>
          <optgroup label={intl.formatMessage(messages.iconifyIcons)}>
            <option value="feather">
              <FormattedMessage
                id="plugins.links.input.feather"
                defaultMessage="Feather"
              />
            </option>
          </optgroup>
        </select>
      </label>

      {iconifyConfig && (
        <label>
          <FormattedMessage
            id="plugins.links.input.customIconifyIdentifier"
            defaultMessage="Custom Iconify Icon"
          />
          <input
            type="text"
            value={iconifyConfig.value}
            onChange={(event) =>
              setIconConfig({
                ...iconifyConfig,
                value: event.target.value,
              })
            }
          />
          <p>
            <FormattedMessage
              id="plugins.links.input.iconifyHelp"
              defaultMessage="Enter the iconify identifier for the icon you want to use in your links. For more detailed info see "
            />
            <a
              href="https://bookcatkid.github.io/TablissNG/docs/widgets/quick-links"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FormattedMessage
                id="plugins.links.input.docsPage"
                defaultMessage="the documentation"
              />
            </a>
            .
          </p>
        </label>
      )}

      {customSvgConfig && (
        <label>
          <FormattedMessage
            id="plugins.links.input.customSvgHtmlLabel"
            defaultMessage="Custom SVG HTML"
          />
          <textarea
            value={customSvgValue}
            rows={20}
            style={{ resize: "vertical" }}
            onChange={(event) => {
              const value = event.target.value;
              props.setCache({
                ...(props.cache || {}),
                [customSvgConfig.cacheKey]: {
                  data: value,
                  type: "svg",
                },
              });
            }}
          />
          <p>
            <FormattedMessage
              id="plugins.links.input.customSvgHelp"
              defaultMessage="Enter your custom SVG HTML code above to use an icon in your links. For more detailed info see "
            />
            <a
              href="https://bookcatkid.github.io/TablissNG/docs/widgets/quick-links"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FormattedMessage
                id="plugins.links.input.docsPage"
                defaultMessage="the documentation"
              />
            </a>
            .
          </p>
        </label>
      )}

      {customImageUrlConfig && (
        <label>
          <FormattedMessage
            id="plugins.links.input.customImageUrlLabel"
            defaultMessage="Custom Image URL"
          />
          <input
            type="text"
            value={customImageUrlConfig.url}
            onChange={(event) =>
              setIconConfig({
                ...customImageUrlConfig,
                url: event.target.value,
              })
            }
          />
          <p>
            <FormattedMessage
              id="plugins.links.input.customImageUrlHelp"
              defaultMessage="Enter a url on the internet for an image file"
            />
          </p>
        </label>
      )}

      {isCustomUpload && (
        <div>
          <label>
            <FormattedMessage
              id="plugins.links.input.uploadIcon"
              defaultMessage="Upload Icon"
            />
            <input
              type="file"
              accept=".svg,.ico,image/*"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      )}

      {isFeather && (
        <div className="icon-picker">
          <button
            onClick={handleOpenModal}
            className="button button--primary"
            style={{ width: "100%" }}
            type="button"
          >
            {featherValue ? (
              <FormattedMessage
                id="plugins.links.input.openIconPicker"
                defaultMessage="Open icon picker"
              />
            ) : (
              <FormattedMessage
                id="plugins.links.input.chooseIcon"
                defaultMessage="Choose an Icon"
              />
            )}
          </button>

          {featherValue && (
            <div className="selected-icon">
              <div className="selected-icon-preview">
                <Icon icon={featherValue} />
              </div>
              <div className="selected-icon-name">
                {(featherValue.includes(":")
                  ? featherValue.split(":")[1]
                  : featherValue
                ).replace(/-/g, " ")}
              </div>
            </div>
          )}
        </div>
      )}

      <SizeInputs
        customWidth={props.customWidth}
        customHeight={props.customHeight}
        conserveAspectRatio={props.conserveAspectRatio}
        resolution={faviconConfig?.resolution}
        showResolutionInput={isFavicon}
        onChange={props.onChange}
        onResolutionChange={(resolution) => {
          const currentIconConfig = props.iconConfig;
          if (currentIconConfig?.type !== "favicon") return;

          const nextFaviconConfig: FaviconConfig = {
            ...currentIconConfig,
            resolution,
          };
          setIconConfig(nextFaviconConfig);
        }}
      />

      <label>
        <FormattedMessage
          id="plugins.links.input.keyboardShortcut"
          defaultMessage="Keyboard shortcut {number}"
          values={{ number: props.number }}
        />
        <input
          type="text"
          value={props.keyboardShortcut || ""}
          onChange={(event) =>
            props.onChange({ keyboardShortcut: event.target.value })
          }
          placeholder={props.number <= 9 ? String(props.number) : ""}
          maxLength={1}
        />
      </label>

      {BUILD_TARGET !== "web" && (
        <label title={intl.formatMessage(messages.useExtensionTabsHelp)}>
          <input
            type="checkbox"
            checked={props.useExtensionTabs || false}
            onChange={(event) =>
              props.onChange({ useExtensionTabs: event.target.checked })
            }
          />
          <FormattedMessage
            id="plugins.links.input.useExtensionTabs"
            defaultMessage="Use browser extension API to open link"
          />
        </label>
      )}

      <hr />

      <IconPickerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelect={handleIconSelect}
      />
    </div>
  );
};

export default Input;
