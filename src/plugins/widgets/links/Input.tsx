import React, { FC, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  IconButton,
  RemoveIcon,
  DownIcon,
  UpIcon,
} from "../../../views/shared";
import { Link, IconCacheItem, Cache } from "./types";
import { Icon } from "@iconify/react";
import { normalizeUrl } from "../../../utils";
import "./Input.sass";
import { IconPickerModal } from "./components/IconPickerModal";
import { SizeInputs } from "./components/SizeInputs";

type Props = Link & {
  number: number;
  onChange: (values: Partial<Link>) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove: () => void;
  cache?: Cache;
  setCache: (cache: Cache) => void;
};

const Input: FC<Props> = (props) => {
  const [urlValue, setUrlValue] = useState(props.url);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const intl = useIntl();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleIconSelect = (icon: string, identifier: string) => {
    props.onChange({ iconifyValue: identifier + icon });
    setIsModalOpen(false);
  };

  const isGoogleOrFavicone =
    props.icon === "_favicon_google" || props.icon === "_favicon_favicone";
  const isCustomIconify = props.icon === "_custom_iconify";
  const isCustomSvg = props.icon === "_custom_svg";
  const isCustomICON = props.icon === "_custom_ico";
  const isCustomUpload = props.icon === "_custom_upload";
  const isFeather = props.icon === "_feather";

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        const cacheKey = `icon_${Date.now()}`;

        let iconData: IconCacheItem;
        if (file.type === "image/svg+xml") {
          iconData = {
            data: result,
            type: "svg",
          };
        } else if (file.type === "image/x-icon") {
          iconData = {
            data: result,
            type: "ico",
          };
        } else {
          iconData = {
            data: result,
            type: "image",
          };
        }

        // Update cache with new icon data
        props.setCache({
          ...(props.cache || {}),
          [cacheKey]: iconData,
        });

        // Update link with reference to cached icon
        props.onChange({
          icon: "_custom_upload",
          iconCacheKey: cacheKey,
        });
      }
    };

    if (file.type === "image/svg+xml") {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="LinkInput">
      <h5>
        <div className="title--buttons">
          <IconButton
            onClick={props.onRemove}
            title={intl.formatMessage({
              id: "plugins.links.input.removeLink",
              defaultMessage: "Remove link",
            })}
          >
            <RemoveIcon />
          </IconButton>
          {props.onMoveDown && (
            <IconButton
              onClick={props.onMoveDown}
              title={intl.formatMessage({
                id: "plugins.links.input.moveDown",
                defaultMessage: "Move link down",
              })}
            >
              <DownIcon />
            </IconButton>
          )}
          {props.onMoveUp && (
            <IconButton
              onClick={props.onMoveUp}
              title={intl.formatMessage({
                id: "plugins.links.input.moveUp",
                defaultMessage: "Move link up",
              })}
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
          value={props.icon}
          onChange={(event) => props.onChange({ icon: event.target.value })}
        >
          <option value="">
            <FormattedMessage
              id="plugins.links.input.none"
              defaultMessage="None"
            />
          </option>
          <optgroup
            label={intl.formatMessage({
              id: "plugins.links.input.websiteIcons",
              defaultMessage: "Website Icons",
            })}
          >
            <option value="_favicon_google">
              <FormattedMessage
                id="plugins.links.input.fromGoogle"
                defaultMessage="From Google"
              />
            </option>
            <option value="_favicon_duckduckgo">
              <FormattedMessage
                id="plugins.links.input.fromDuckDuckGo"
                defaultMessage="From DuckDuckGo"
              />
            </option>
            <option value="_favicon_favicone">
              <FormattedMessage
                id="plugins.links.input.fromFavicone"
                defaultMessage="From Favicone"
              />
            </option>
          </optgroup>
          <optgroup
            label={intl.formatMessage({
              id: "plugins.links.input.custom",
              defaultMessage: "Custom",
            })}
          >
            <option value="_custom_iconify">
              <FormattedMessage
                id="plugins.links.input.fromIconify"
                defaultMessage="From Iconify"
              />
            </option>
            <option value="_custom_svg">
              <FormattedMessage
                id="plugins.links.input.customSvgHtml"
                defaultMessage="Custom SVG HTML"
              />
            </option>
            <option value="_custom_ico">
              <FormattedMessage
                id="plugins.links.input.customImageUrl"
                defaultMessage="Custom Image URL"
              />
            </option>
            <option value="_custom_upload">
              <FormattedMessage
                id="plugins.links.input.uploadCustomIcon"
                defaultMessage="Upload Custom Icon"
              />
            </option>
          </optgroup>
          <optgroup
            label={intl.formatMessage({
              id: "plugins.links.input.iconifyIcons",
              defaultMessage: "Iconify Icons",
            })}
          >
            <option value="_feather">
              <FormattedMessage
                id="plugins.links.input.feather"
                defaultMessage="Feather"
              />
            </option>
          </optgroup>
        </select>
      </label>

      {isCustomIconify && (
        <label>
          <FormattedMessage
            id="plugins.links.input.customIconifyIdentifier"
            defaultMessage="Custom Iconify Identifier"
          />
          <input
            type="text"
            value={props.iconifyValue || ""}
            onChange={(event) =>
              props.onChange({
                iconifyValue: event.target.value,
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

      {isCustomSvg && (
        <label>
          <FormattedMessage
            id="plugins.links.input.customSvgHtmlLabel"
            defaultMessage="Custom SVG HTML"
          />
          <textarea
            value={
              (props.iconCacheKey && props.cache?.[props.iconCacheKey]?.data) ||
              ""
            }
            style={{ resize: "vertical" }}
            onChange={(event) => {
              const value = event.target.value;
              const cacheKey = props.iconCacheKey || `icon_svg_${props.id}`;
              props.setCache({
                ...(props.cache || {}),
                [cacheKey]: {
                  data: value,
                  type: "svg",
                },
              });
              props.onChange({ iconCacheKey: cacheKey });
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

      {isCustomICON && (
        <label>
          <FormattedMessage
            id="plugins.links.input.customImageUrlLabel"
            defaultMessage="Custom Image URL"
          />
          <input
            type="text"
            value={
              (props.iconCacheKey && props.cache?.[props.iconCacheKey]?.data) ||
              ""
            }
            onChange={(event) => {
              const value = event.target.value;
              const cacheKey = props.iconCacheKey || `icon_ico_${props.id}`;
              props.setCache({
                ...(props.cache || {}),
                [cacheKey]: {
                  data: value,
                  type: "ico",
                },
              });
              props.onChange({ iconCacheKey: cacheKey });
            }}
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
          >
            {props.iconifyValue ? (
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

          {props.iconifyValue && (
            <div className="selected-icon">
              <div className="selected-icon-preview">
                <Icon icon={props.iconifyValue} />
              </div>
              <div className="selected-icon-name">
                {(props.iconifyValue.includes(":")
                  ? props.iconifyValue.split(":")[1]
                  : props.iconifyValue
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
        iconSize={props.iconSize}
        showResolutionInput={isGoogleOrFavicone}
        onChange={props.onChange}
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
        <label
          title={intl.formatMessage({
            id: "plugins.links.input.useExtensionTabsHelp",
            defaultMessage:
              "When enabled, links open through the browser extension API instead of the default browser behavior. Useful for restricted URLs like file://, about:, or browser settings. Some URLs will always open through the extension API regardless of this setting.",
          })}
        >
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
