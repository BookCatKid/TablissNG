import "./Input.sass";

import type { ChangeEvent } from "react";
import { FC, useEffect, useRef, useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";

import { Icon } from "../../../icons";
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
    description: "Button title to remove a link from the list",
  },
  moveDown: {
    id: "plugins.links.input.moveDown",
    defaultMessage: "Move link down",
    description: "Button title to move a link down in the list",
  },
  moveUp: {
    id: "plugins.links.input.moveUp",
    defaultMessage: "Move link up",
    description: "Button title to move a link up in the list",
  },
  websiteIcons: {
    id: "plugins.links.input.websiteIcons",
    defaultMessage: "Website Icons",
    description: "Group label for website favicon options",
  },
  custom: {
    id: "plugins.links.input.custom",
    defaultMessage: "Custom",
    description: "Group label for custom icon options",
  },
  iconifyIcons: {
    id: "plugins.links.input.iconifyIcons",
    defaultMessage: "Iconify Icons",
    description: "Group label for Iconify icon options",
  },
  useExtensionTabsHelp: {
    id: "plugins.links.input.useExtensionTabsHelp",
    defaultMessage:
      "When enabled, links open through the browser extension API instead of the default browser behavior. Useful for restricted URLs like file://, about:, or browser settings. Some URLs will always open through the extension API regardless of this setting.",
    description: "Help tooltip explaining the extension tabs toggle",
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
      description="Link text pointing to the Quick Links documentation"
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
  const pendingUploadRef = useRef<{
    cacheKey: string;
    iconData: IconCacheItem;
  } | null>(null);
  const intl = useIntl();

  const iconSelectValue = getIconSelectValue(iconConfig);

  useEffect(() => {
    const pendingUpload = pendingUploadRef.current;
    if (
      !pendingUpload ||
      iconConfig?.type !== "custom_upload" ||
      iconConfig.cacheKey !== pendingUpload.cacheKey
    ) {
      return;
    }

    setCache({
      ...(cache || {}),
      [pendingUpload.cacheKey]: pendingUpload.iconData,
    });
    pendingUploadRef.current = null;
  }, [cache, iconConfig, setCache]);

  const setIconConfig = (newConfig?: IconConfig) => {
    const oldConfig = iconConfig;
    const oldKey =
      oldConfig?.type === "custom_svg" || oldConfig?.type === "custom_upload"
        ? oldConfig.cacheKey
        : undefined;

    if (oldKey && cache?.[oldKey] && oldConfig?.type !== newConfig?.type) {
      setCache(removeCacheKey(cache, oldKey));
    }

    if (oldConfig?.type !== newConfig?.type) {
      setSvgDraft(null);
    }

    onChange({ iconConfig: newConfig });
  };

  const handleIconSelect = (iconString: string) => {
    setIconConfig({
      type: iconString.startsWith("feather:") ? "feather" : "iconify",
      value: iconString,
    });
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

        const cacheKey = `icon_${Date.now()}`;
        pendingUploadRef.current = { cacheKey, iconData };
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
              description="Label for setting a custom Iconify identifier"
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
                defaultMessage="Enter the iconify identifier for the icon you want to use in your links. For more detailed info see"
                description="Help text for the Iconify identifier input"
              />{" "}
              <DocsLink />.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="button button--primary"
              style={{ width: "100%" }}
              type="button"
            >
              <FormattedMessage
                id="plugins.links.input.openIconPicker"
                defaultMessage="Open icon picker"
                description="Button text to open the icon picker dialog"
              />
            </button>
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
              description="Label for the custom SVG HTML input area"
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
                  description="Button text to apply custom SVG changes"
                />
              </button>
            )}
            <p>
              <FormattedMessage
                id="plugins.links.input.customSvgHelp"
                defaultMessage="Enter your custom SVG HTML code above to use an icon in your links. For more detailed info see"
                description="Help text for the custom SVG input area"
              />{" "}
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
              description="Label for the custom image URL input"
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
                description="Help text for the custom image URL input"
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
                description="Label for the icon file input"
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
                  description="Button text to open the icon picker dialog"
                />
              ) : (
                <FormattedMessage
                  id="plugins.links.input.chooseIcon"
                  defaultMessage="Choose an Icon"
                  description="Button text asking the user to choose an icon"
                />
              )}
            </button>

            {featherValue && (
              <div className="selected-icon">
                <div className="selected-icon-preview">
                  <Icon name={featherValue} />
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
            description="Keyboard shortcut identifier for this link"
            values={{ number }}
          />
        ) : (
          <FormattedMessage
            id="plugins.links.input.shortcut"
            defaultMessage="Shortcut"
            description="Shortcut heading for links beyond number nine"
          />
        )}
      </h5>

      <label>
        <FormattedMessage
          id="plugins.links.input.url"
          defaultMessage="URL"
          description="Label for the URL input field"
        />
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
        <FormattedMessage
          id="plugins.links.input.name"
          defaultMessage="Name"
          description="Label for the link name input"
        />{" "}
        <span className="text--grey">
          (
          <FormattedMessage
            id="plugins.links.input.optional"
            defaultMessage="optional"
            description="Label indicating an input is optional"
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
        <FormattedMessage
          id="plugins.links.input.icon"
          defaultMessage="Icon"
          description="Label for the icon selector"
        />{" "}
        <span className="text--grey">
          (
          <FormattedMessage
            id="plugins.links.input.optional"
            defaultMessage="optional"
            description="Label indicating an input is optional"
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
              description="Dropdown option to select no icon"
            />
          </option>
          <optgroup label={intl.formatMessage(messages.websiteIcons)}>
            <option value="favicon_google">
              <FormattedMessage
                id="plugins.links.input.fromGoogle"
                defaultMessage="From Google"
                description="Dropdown option to fetch a favicon from Google"
              />
            </option>
            <option value="favicon_duckduckgo">
              <FormattedMessage
                id="plugins.links.input.fromDuckDuckGo"
                defaultMessage="From DuckDuckGo"
                description="Dropdown option to fetch a favicon from DuckDuckGo"
              />
            </option>
            <option value="favicon_favicone">
              <FormattedMessage
                id="plugins.links.input.fromFavicone"
                defaultMessage="From Favicone"
                description="Dropdown option to fetch a favicon from Favicone"
              />
            </option>
          </optgroup>
          <optgroup label={intl.formatMessage(messages.custom)}>
            <option value="custom_svg">
              <FormattedMessage
                id="plugins.links.input.customSvgHtml"
                defaultMessage="Custom SVG HTML"
                description="Dropdown option to use custom SVG HTML"
              />
            </option>
            <option value="custom_image_url">
              <FormattedMessage
                id="plugins.links.input.customImageUrl"
                defaultMessage="Custom Image URL"
                description="Dropdown option to use a custom image URL"
              />
            </option>
            <option value="custom_upload">
              <FormattedMessage
                id="plugins.links.input.uploadCustomIcon"
                defaultMessage="Upload Custom Icon"
                description="Dropdown option to upload a custom icon"
              />
            </option>
          </optgroup>
          <optgroup label={intl.formatMessage(messages.iconifyIcons)}>
            <option value="iconify">
              <FormattedMessage
                id="plugins.links.input.fromIconify"
                defaultMessage="From Iconify"
                description="Dropdown option to use an Iconify icon"
              />
            </option>
            <option value="feather">
              <FormattedMessage
                id="plugins.links.input.feather"
                defaultMessage="Feather"
                description="Dropdown option to select a Feather icon"
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
          description="Keyboard shortcut identifier for this link"
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
            description="Toggle label to open links through the extension API"
          />
        </label>
      )}

      <hr />

      <IconPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleIconSelect}
        selectedIcon={
          iconConfig && "value" in iconConfig ? iconConfig.value : undefined
        }
      />
    </div>
  );
};

export default Input;
