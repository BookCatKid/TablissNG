import "./Input.sass";

import { Icon } from "@iconify/react";
import icons from "feather-icons/dist/icons.json";
import type { ChangeEvent } from "react";
import { FC, useEffect, useRef, useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";

import { addIconData, normalizeUrl } from "../../../utils";
import {
  DownIcon,
  IconButton,
  RemoveIcon,
  UpIcon,
} from "../../../views/shared";
import { Cache, IconCacheItem, Link } from "./types";

const messages = defineMessages({
  githubIssue: {
    id: "plugins.links.input.githubIssue",
    defaultMessage: "this GitHub issue",
    description: "Link text pointing to a GitHub issue for help",
  },
  optional: {
    id: "plugins.links.input.optional",
    defaultMessage: "optional",
    description: "Label indicating an input field is optional",
  },
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
  custom: {
    id: "plugins.links.input.custom",
    defaultMessage: "Custom",
    description: "Group label for custom icon options",
  },
  websiteIcons: {
    id: "plugins.links.input.websiteIcons",
    defaultMessage: "Website Icons",
    description: "Group label for website favicon options",
  },
  iconifyIcons: {
    id: "plugins.links.input.iconifyIcons",
    defaultMessage: "Iconify Icons",
    description: "Group label for iconify icon options",
  },
  searchIcons: {
    id: "plugins.links.input.searchIcons",
    defaultMessage: "Search icons...",
    description: "Placeholder text for searching icons",
  },
  useExtensionTabsHelp: {
    id: "plugins.links.input.useExtensionTabsHelp",
    defaultMessage:
      "When enabled, links open through the browser extension API instead of the default browser behavior. Useful for restricted URLs like file://, about:, or browser settings. Some URLs will always open through the extension API regardless of this setting.",
    description: "Help tooltip explaining the use extension tabs toggle",
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

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
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
            description="Keyboard shortcut identifier for this link"
          />
        ) : (
          <FormattedMessage
            id="plugins.links.input.shortcut"
            defaultMessage="Shortcut"
            description="Heading indicating the keyboard shortcut when number exceeds 9"
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
            props.onChange({ url: normalized });
          }}
        />
      </label>
      <label>
        <FormattedMessage
          id="plugins.links.input.name"
          defaultMessage="Name"
          description="Label for the name input field"
        />{" "}
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
        <FormattedMessage
          id="plugins.links.input.icon"
          defaultMessage="Icon"
          description="Label for the icon dropdown selector"
        />{" "}
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
              description="Dropdown option to select no icon"
            />
          </option>
          <optgroup label={intl.formatMessage(messages.websiteIcons)}>
            <option value="_favicon_google">
              <FormattedMessage
                id="plugins.links.input.fromGoogle"
                defaultMessage="From Google"
                description="Dropdown option to fetch favicon from Google"
              />
            </option>
            <option value="_favicon_duckduckgo">
              <FormattedMessage
                id="plugins.links.input.fromDuckDuckGo"
                defaultMessage="From DuckDuckGo"
                description="Dropdown option to fetch favicon from DuckDuckGo"
              />
            </option>
            <option value="_favicon_favicone">
              <FormattedMessage
                id="plugins.links.input.fromFavicone"
                defaultMessage="From Favicone"
                description="Dropdown option to fetch favicon from Favicone"
              />
            </option>
          </optgroup>
          <optgroup label={intl.formatMessage(messages.custom)}>
            <option value="_custom_iconify">
              <FormattedMessage
                id="plugins.links.input.fromIconify"
                defaultMessage="From Iconify"
                description="Dropdown option to fetch an icon from Iconify"
              />
            </option>
            <option value="_custom_svg">
              <FormattedMessage
                id="plugins.links.input.customSvgHtml"
                defaultMessage="Custom SVG HTML"
                description="Dropdown option to use custom SVG HTML"
              />
            </option>
            <option value="_custom_ico">
              <FormattedMessage
                id="plugins.links.input.customImageUrl"
                defaultMessage="Custom Image URL"
                description="Dropdown option to use a custom image URL"
              />
            </option>
            <option value="_custom_upload">
              <FormattedMessage
                id="plugins.links.input.uploadCustomIcon"
                defaultMessage="Upload Custom Icon"
                description="Dropdown option to upload a custom icon file"
              />
            </option>
          </optgroup>
          <optgroup label={intl.formatMessage(messages.iconifyIcons)}>
            <option value="_feather">
              <FormattedMessage
                id="plugins.links.input.feather"
                defaultMessage="Feather"
                description="Dropdown option to select a Feather icon"
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
            description="Label for setting a custom Iconify identifier"
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
              defaultMessage="Enter the iconify identifier for the icon you want to use in your links. For more detailed info see"
              description="Help text for Iconify identifier input"
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
            description="Label for the custom SVG HTML input area"
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
              defaultMessage="Enter your custom SVG HTML code above to use an icon in your links. For more detailed info see"
              description="Help text for the custom SVG input area"
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
            description="Label for custom image URL input"
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
              description="Help text for the custom image URL input"
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
              description="Label for the file input to upload an icon"
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
                description="Button text to open the icon picker dialog"
              />
            ) : (
              <FormattedMessage
                id="plugins.links.input.chooseIcon"
                defaultMessage="Choose an Icon"
                description="Button text asking user to choose an icon"
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
              description="Checkbox label to maintain icon aspect ratio"
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
                description="Input label for scaling the icon size proportionately"
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
                  description="Input label for icon width"
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
                  description="Input label for icon height"
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
              description="Input label for overall icon size"
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
              description="Warning message explaining SVG scaling limitations"
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
                description="Dialog title for the icon picker"
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
                    description="Message shown when icon search yields no results"
                  />
                </p>
              )}
            </div>

            <button className="close-button" onClick={handleCloseModal}>
              <FormattedMessage
                id="plugins.links.input.cancel"
                defaultMessage="Cancel"
                description="Button text to cancel icon selection"
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
          description="Keyboard shortcut identifier for this link"
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
            description="Toggle label to open links via extension tabs API"
          />
        </label>
      )}
      <hr />
    </div>
  );
};

export default Input;
