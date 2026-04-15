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

const removeCacheKey = (cache: Cache | undefined, cacheKey?: string): Cache => {
  if (!cache || !cacheKey || !cache[cacheKey]) return cache || {};
  const nextCache = { ...cache };
  delete nextCache[cacheKey];
  return nextCache;
};

const DocsLink: FC = () => (
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
);

const Input: FC<Props> = ({
  number,
  url,
  name,
  iconConfig,
  customWidth,
  customHeight,
  conserveAspectRatio,
  keyboardShortcut,
  useExtensionTabs,
  cache,
  onChange,
  onMoveUp,
  onMoveDown,
  onRemove,
  setCache,
}) => {
  const [urlValue, setUrlValue] = useState(url);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [svgDraft, setSvgDraft] = useState<string | null>(null);
  const intl = useIntl();

  const iconSelectValue = getIconSelectValue(iconConfig);

  const setIconConfig = (newConfig?: IconConfig) => {
    const oldConfig = iconConfig;
    const oldKey =
      oldConfig?.type === "custom_svg" || oldConfig?.type === "custom_upload"
        ? oldConfig.cacheKey
        : undefined;

    if (oldKey && cache?.[oldKey] && oldConfig?.type !== newConfig?.type) {
      setCache(removeCacheKey(cache, oldKey));
    }

    onChange({ iconConfig: newConfig });
  };

  const handleIconSelect = (iconString: string) => {
    if (iconConfig?.type === "feather") {
      setIconConfig({ ...iconConfig, value: iconString });
    }
    setIsModalOpen(false);
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
          iconConfig?.type === "custom_svg" ||
          iconConfig?.type === "custom_upload"
            ? iconConfig.cacheKey
            : undefined;
        const cacheKey = `icon_${Date.now()}`;
        const baseCache = oldKey ? removeCacheKey(cache, oldKey) : cache;
        setCache({ ...baseCache, [cacheKey]: iconData });
        setIconConfig({ type: "custom_upload", cacheKey });
      }
    };

    if (file.type === "image/svg+xml") {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const renderIconFields = () => {
    switch (iconConfig?.type) {
      case "iconify":
        return (
          <label>
            <FormattedMessage
              id="plugins.links.input.customIconifyIdentifier"
              defaultMessage="Custom Iconify Icon"
            />
            <input
              type="text"
              value={iconConfig.value}
              onChange={(event) =>
                setIconConfig({ ...iconConfig, value: event.target.value })
              }
            />
            <p>
              <FormattedMessage
                id="plugins.links.input.iconifyHelp"
                defaultMessage="Enter the iconify identifier for the icon you want to use in your links. For more detailed info see "
              />
              <DocsLink />.
            </p>
          </label>
        );

      case "custom_svg": {
        const savedValue = cache?.[iconConfig.cacheKey]?.data || "";
        const displayValue = svgDraft ?? savedValue;
        const hasUnappliedChanges =
          svgDraft !== null && svgDraft !== savedValue;

        return (
          <label>
            <FormattedMessage
              id="plugins.links.input.customSvgHtmlLabel"
              defaultMessage="Custom SVG HTML"
            />
            <textarea
              value={displayValue}
              rows={20}
              style={{ resize: "vertical" }}
              onChange={(event) => setSvgDraft(event.target.value)}
            />
            {hasUnappliedChanges && (
              <button
                type="button"
                className="button button--primary"
                style={{ marginTop: "0.5em" }}
                onClick={() => {
                  setCache({
                    ...(cache || {}),
                    [iconConfig.cacheKey]: { data: svgDraft, type: "svg" },
                  });
                  setSvgDraft(null);
                }}
              >
                <FormattedMessage
                  id="plugins.links.input.applySvg"
                  defaultMessage="Apply"
                />
              </button>
            )}
            <p>
              <FormattedMessage
                id="plugins.links.input.customSvgHelp"
                defaultMessage="Enter your custom SVG HTML code above to use an icon in your links. For more detailed info see "
              />
              <DocsLink />.
            </p>
          </label>
        );
      }

      case "custom_image_url":
        return (
          <label>
            <FormattedMessage
              id="plugins.links.input.customImageUrlLabel"
              defaultMessage="Custom Image URL"
            />
            <input
              type="text"
              value={iconConfig.url}
              onChange={(event) =>
                setIconConfig({ ...iconConfig, url: event.target.value })
              }
            />
            <p>
              <FormattedMessage
                id="plugins.links.input.customImageUrlHelp"
                defaultMessage="Enter a url on the internet for an image file"
              />
            </p>
          </label>
        );

      case "custom_upload":
        return (
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
        );

      case "feather": {
        const featherValue = iconConfig.value;
        return (
          <div className="icon-picker">
            <button
              onClick={() => setIsModalOpen(true)}
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
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="LinkInput">
      <h5>
        <div className="title--buttons">
          <IconButton
            onClick={onRemove}
            title={intl.formatMessage(messages.removeLink)}
          >
            <RemoveIcon />
          </IconButton>
          {onMoveDown && (
            <IconButton
              onClick={onMoveDown}
              title={intl.formatMessage(messages.moveDown)}
            >
              <DownIcon />
            </IconButton>
          )}
          {onMoveUp && (
            <IconButton
              onClick={onMoveUp}
              title={intl.formatMessage(messages.moveUp)}
            >
              <UpIcon />
            </IconButton>
          )}
        </div>

        {number <= 9 ? (
          <FormattedMessage
            id="plugins.links.input.keyboardShortcut"
            defaultMessage="Keyboard shortcut {number}"
            values={{ number }}
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
            onChange({ url: normalized });
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
          value={name}
          onChange={(event) => onChange({ name: event.target.value })}
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
            setIconConfig(
              getDefaultIconConfig(event.target.value as IconSelectValue),
            )
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

      {renderIconFields()}

      <SizeInputs
        customWidth={customWidth}
        customHeight={customHeight}
        conserveAspectRatio={conserveAspectRatio}
        resolution={
          iconConfig?.type === "favicon" ? iconConfig.resolution : undefined
        }
        showResolutionInput={iconConfig?.type === "favicon"}
        onChange={onChange}
        onResolutionChange={(resolution) => {
          if (iconConfig?.type !== "favicon") return;
          setIconConfig({ ...iconConfig, resolution } as FaviconConfig);
        }}
      />

      <label>
        <FormattedMessage
          id="plugins.links.input.keyboardShortcut"
          defaultMessage="Keyboard shortcut {number}"
          values={{ number }}
        />
        <input
          type="text"
          value={keyboardShortcut || ""}
          onChange={(event) =>
            onChange({ keyboardShortcut: event.target.value })
          }
          placeholder={number <= 9 ? String(number) : ""}
          maxLength={1}
        />
      </label>

      {BUILD_TARGET !== "web" && (
        <label title={intl.formatMessage(messages.useExtensionTabsHelp)}>
          <input
            type="checkbox"
            checked={useExtensionTabs || false}
            onChange={(event) =>
              onChange({ useExtensionTabs: event.target.checked })
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
        onClose={() => setIsModalOpen(false)}
        onSelect={handleIconSelect}
      />
    </div>
  );
};

export default Input;
