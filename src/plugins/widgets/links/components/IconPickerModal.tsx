import React, { FC, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Icon } from "@iconify/react";
import icons from "feather-icons/dist/icons.json";
import { addIconData } from "../../../../utils";

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (icon: string, identifier: string) => void;
}

const iconList = Object.keys(icons);

export const IconPickerModal: FC<IconPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();

  if (!isOpen) return null;

  const handleIconSelect = (icon: string, identifier: string) => {
    addIconData(identifier + icon);
    onSelect(icon, identifier);
  };

  // Filter icons based on search query
  const filteredIcons = iconList.filter((icon) => {
    const searchQueryNoSpaces = searchQuery.replace(/\s/g, "-");
    return (
      icon.toLowerCase().includes(searchQuery.toLowerCase()) ||
      icon.toLowerCase().includes(searchQueryNoSpaces)
    );
  });

  return (
    <div className="Modal-container" onClick={onClose}>
      <div className="Modal" onClick={(event) => event.stopPropagation()}>
        <h2>
          <FormattedMessage
            id="plugins.links.input.selectIcon"
            defaultMessage="Select an Icon"
          />
        </h2>

        <input
          type="text"
          placeholder={intl.formatMessage({
            id: "plugins.links.input.searchIcons",
            defaultMessage: "Search icons...",
          })}
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

        <button className="close-button" onClick={onClose}>
          <FormattedMessage
            id="plugins.links.input.cancel"
            defaultMessage="Cancel"
          />
        </button>
      </div>
    </div>
  );
};
