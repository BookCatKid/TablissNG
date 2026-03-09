import icons from "feather-icons/dist/icons.json";
import React, { FC, useState, useRef, useEffect } from "react";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import {
  IconButton,
  RemoveIcon,
  DownIcon,
  UpIcon,
} from "../../../views/shared";
import { Link, IconCacheItem, Cache } from "./types";
import { Icon } from "@iconify/react";
import { addIconData, normalizeUrl } from "../../../utils";
import "./Input.sass";

const messages = defineMessages({
  githubIssue: {
    id: "plugins.links.input.githubIssue",
    defaultMessage: "this GitHub issue",
  },
  optional: {
    id: "plugins.links.input.optional",
    defaultMessage: "optional",
  },
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
  custom: {
    id: "plugins.links.input.custom",
    defaultMessage: "Custom",
  },
  websiteIcons: {
    id: "plugins.links.input.websiteIcons",
    defaultMessage: "Website Icons",
  },
  iconifyIcons: {
    id: "plugins.links.input.iconifyIcons",
    defaultMessage: "Iconify Icons",
  },
  searchIcons: {
    id: "plugins.links.input.searchIcons",
    defaultMessage: "Search icons...",
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

const iconList = Object.keys(icons);

const Input: FC<Props> = (props) => {
  const [urlValue, setUrlValue] = useState(props.url);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectRef = useRef<HTMLSelectElement>(null);
  const intl = useIntl();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleIconSelect = (icon: string, identifier: string) => {
    addIconData(identifier + icon);
    props.onChange({ iconifyIdentifier: identifier, iconifyValue: icon });
    setIsModalOpen(false);
  };

  // Filter icons based on search query
  const filteredIcons = iconList.filter((icon) => {
    const searchQueryNoSpaces = searchQuery.replace(/\s/g, "-");
    return (
      icon.toLowerCase().includes(searchQuery.toLowerCase()) ||
      icon.toLowerCase().includes(searchQueryNoSpaces)
    );
  });

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
        const iconSize = props.customWidth || 24;
        const cacheKey = `icon_${Date.now()}`;

        let iconData: IconCacheItem;
        if (file.type === "image/svg+xml") {
          iconData = {
            data: result,
            type: "svg",
            size: iconSize,
          };
        } else if (file.type === "image/x-icon") {
          iconData = {
            data: result,
            type: "ico",
            size: iconSize,
          };
        } else {
          iconData = {
            data: result,
            type: "image",
            size: iconSize,
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
          customWidth: iconSize,
        });
      }
    };

    if (file.type === "image/svg+xml") {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const getSelectValues = () => {
    const values: string[] = [];
    if (selectRef.current) {
      const options = selectRef.current.options;
      for (let i = 0; i < options.length; i++) {
        values.push(options[i].value);
      }
    }
    return values;
  };

  // Migrate to new method of storing icons, the old one would cause the select to display the wrong value after my changes
  useEffect(() => {
    if (props.icon === "_favicon") {
      props.onChange({ icon: "_favicon_google" });
    } else if (props.icon && !getSelectValues().includes(props.icon)) {
      props.onChange({
        iconifyValue: props.icon,
        iconifyIdentifier: "feather:",
        icon: "_feather",
      });
    }
  }, [props.icon]);

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
          (<FormattedMessage {...messages.optional} />)
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
          (<FormattedMessage {...messages.optional} />)
        </span>
        <select
          ref={selectRef}
          value={props.icon}
          onChange={(event) => props.onChange({ icon: event.target.value })}
        >
          <option value="">
            <FormattedMessage
              id="plugins.links.input.none"
              defaultMessage="None"
            />
          </option>
          <optgroup label={intl.formatMessage(messages.websiteIcons)}>
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
          <optgroup label={intl.formatMessage(messages.custom)}>
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
          <optgroup label={intl.formatMessage(messages.iconifyIcons)}>
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
            value={props.IconString}
            onChange={(event) =>
              props.onChange({ IconString: event.target.value })
            }
          />
          <p>
            <FormattedMessage
              id="plugins.links.input.iconifyHelp"
              defaultMessage="Enter the iconify identifier for the icon you want to use in your links. For more detailed info see "
            />
            &nbsp;
            <a
              href="https://github.com/BookCatKid/TablissNG/issues/3#issuecomment-2676456153"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FormattedMessage {...messages.githubIssue} />
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
            value={props.SvgString}
            style={{ resize: "vertical" }}
            onChange={(event) =>
              props.onChange({ SvgString: event.target.value })
            }
          />
          <p>
            <FormattedMessage
              id="plugins.links.input.customSvgHelp"
              defaultMessage="Enter your custom SVG HTML code above to use an icon in your links. For more detailed info see "
            />
            &nbsp;
            <a
              href="https://github.com/BookCatKid/TablissNG/issues/3#issuecomment-2676456153"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FormattedMessage {...messages.githubIssue} />
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
            value={props.IconStringIco}
            onChange={(event) =>
              props.onChange({ IconStringIco: event.target.value })
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
          <button onClick={handleOpenModal} className="custom-select">
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

          {/* Show currently selected Feather icon with preview */}
          {props.iconifyValue && (
            <div className="selected-icon-display">
              <div className="icon-preview">
                <Icon icon={`feather:${props.iconifyValue}`} />
              </div>
              <div className="icon-info">
                <span className="icon-name">
                  {props.iconifyValue.replace(/-/g, " ")}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {(isCustomICON ||
        (isCustomUpload &&
          props.iconCacheKey &&
          props.cache &&
          props.cache[props.iconCacheKey]?.type !== "svg")) && (
        <>
          <label>
            <FormattedMessage
              id="plugins.links.input.conserveAspectRatio"
              defaultMessage="Conserve Aspect Ratio"
            />
            <input
              className="conserveAspectRatioButton"
              type="checkbox"
              checked={props.conserveAspectRatio}
              onChange={(event) =>
                props.onChange({ conserveAspectRatio: event.target.checked })
              }
            />
          </label>
          {props.conserveAspectRatio ? (
            <label>
              <FormattedMessage
                id="plugins.links.input.scale"
                defaultMessage="Scale"
              />
              <input
                type="number"
                value={props.customWidth}
                onChange={(event) => {
                  props.onChange({
                    customWidth: Number(event.target.value),
                    customHeight: Number(event.target.value),
                  });
                }}
              />
            </label>
          ) : (
            <>
              <label>
                <FormattedMessage
                  id="plugins.links.input.iconWidth"
                  defaultMessage="Icon Width"
                />
                <input
                  type="number"
                  value={props.customWidth ?? 24}
                  onChange={(event) =>
                    props.onChange({ customWidth: Number(event.target.value) })
                  }
                />
              </label>
              <label>
                <FormattedMessage
                  id="plugins.links.input.iconHeight"
                  defaultMessage="Icon Height"
                />
                <input
                  type="number"
                  value={props.customHeight ?? 24}
                  onChange={(event) =>
                    props.onChange({ customHeight: Number(event.target.value) })
                  }
                />
              </label>
            </>
          )}
        </>
      )}

      {(isCustomSvg ||
        (isCustomUpload &&
          props.iconCacheKey &&
          props.cache &&
          props.cache[props.iconCacheKey]?.type === "svg")) && (
        <div>
          <label>
            <FormattedMessage
              id="plugins.links.input.iconSize"
              defaultMessage="Icon Size"
            />
            <input
              type="number"
              value={props.customWidth ?? 24}
              onChange={(event) => {
                props.onChange({
                  customWidth: Number(event.target.value),
                  customHeight: Number(event.target.value),
                });
              }}
            />
          </label>
          <p className="no-svg-scaling-warning">
            <FormattedMessage
              id="plugins.links.input.svgScalingWarning"
              defaultMessage="Currently svgs do not support custom dimensions."
            />
          </p>
        </div>
      )}

      {isGoogleOrFavicone && (
        <label>
          Icon Size
          <select
            value={props.iconSize ?? 256}
            onChange={(event) =>
              props.onChange({ iconSize: Number(event.target.value) })
            }
          >
            <option value="16">16x16</option>
            <option value="32">32x32</option>
            <option value="64">64x64</option>
            <option value="128">128x128</option>
            <option value="256">256x256</option>
          </select>
        </label>
      )}

      {isModalOpen && (
        <div className="Modal-container" onClick={handleCloseModal}>
          <div className="Modal" onClick={(event) => event.stopPropagation()}>
            <h2>
              <FormattedMessage
                id="plugins.links.input.selectIcon"
                defaultMessage="Select an Icon"
              />
            </h2>

            <input
              type="text"
              placeholder={intl.formatMessage(messages.searchIcons)}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="search-bar"
            />

            <div className="icon-grid">
              {filteredIcons.length > 0 ? (
                filteredIcons.map((icon) => (
                  <button
                    key={icon}
                    className="icon-box"
                    onClick={() => handleIconSelect(icon, "feather:")}
                  >
                    <Icon icon={"feather:" + icon} />
                    <span>{icon.replace(/-/g, " ")}</span>
                  </button>
                ))
              ) : (
                <p className="no-results">
                  <FormattedMessage
                    id="plugins.links.input.noIconsFound"
                    defaultMessage="No icons found"
                  />
                </p>
              )}
            </div>

            <button className="close-button" onClick={handleCloseModal}>
              <FormattedMessage
                id="plugins.links.input.cancel"
                defaultMessage="Cancel"
              />
            </button>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default Input;
