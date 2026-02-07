import React, { FC, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Icon } from "@iconify/react";
import icons from "feather-icons/dist/icons.json";
import { addIconData } from "../../../../utils";
import Modal from "../../../../views/shared/modal/Modal";

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (icon: string, identifier: string) => void;
}

const iconList = Object.keys(icons);
const iconifyIdentifier = "feather:";

export const IconPickerModal: FC<IconPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();

  if (!isOpen) return null;

  const handleIconSelect = (icon: string) => {
    addIconData(iconifyIdentifier + icon);
    onSelect(icon, iconifyIdentifier);
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
    <Modal
      onClose={onClose}
      className="IconPickerModal"
      center
      footer={
        <button
          type="button"
          className="button button--primary"
          onClick={onClose}
        >
          <FormattedMessage
            id="plugins.links.input.cancel"
            defaultMessage="Cancel"
          />
        </button>
      }
    >
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
        autoFocus
      />

      <div className="icon-grid">
        {filteredIcons.length > 0 ? (
          filteredIcons.map((icon) => (
            <button
              key={icon}
              className="icon-box"
              onClick={() => handleIconSelect(icon)}
              type="button"
            >
              <Icon icon={iconifyIdentifier + icon} />
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
    </Modal>
  );
};
