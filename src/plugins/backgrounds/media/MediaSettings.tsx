import "./MediaSettings.sass";

import { useState } from "react";
import { type FC } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";

import { useObjectUrls } from "../../../hooks";
import { backgroundMessages } from "../../../locales/messages";
import { IconButton, RemoveIcon } from "../../../views/shared";
import BaseSettings from "../base/BaseSettings";
import { defaultCache, defaultData, Props } from "./types";

const messages = defineMessages({
  removeMedia: {
    id: "backgrounds.media.removeMedia",
    defaultMessage: "Remove media",
    description: "Title for remove media button",
  },
  expand: {
    id: "backgrounds.media.expand",
    defaultMessage: "Expand",
    description: "Link text to expand uploaded media previews",
  },
  collapse: {
    id: "backgrounds.media.collapse",
    defaultMessage: "Collapse",
    description: "Link text to collapse uploaded media previews",
  },
});

const ImageSettings: FC<Props> = ({
  cache = defaultCache,
  setCache,
  data = defaultData,
  setData,
}) => {
  const intl = useIntl();
  const urls = useObjectUrls(cache.items);
  const [isExpanded, setIsExpanded] = useState(false);

  const addMedia = (files: FileList) => {
    const newFiles = Array.from(files).filter(
      (file) =>
        file.type.match(/^video\/(mp4|webm|ogg)$/) ||
        file.type.match(/^image\//),
    );
    const items = cache.items ? cache.items.concat(newFiles) : newFiles;
    setCache({
      ...(cache || defaultCache),
      items,
      cursor: 0,
      rotated: Date.now(),
      deps: [],
    });
  };

  const removeMedia = (index: number) =>
    setCache({
      ...(cache || defaultCache),
      items: (cache.items || []).filter((_, i) => index !== i),
      cursor: 0,
      rotated: Date.now(),
      deps: [],
    });

  const largeMedia = (cache.items || []).some((media) => media.size > 2097152);

  return (
    <div className="MediaSettings">
      <BaseSettings
        data={data}
        setData={setData}
        title={
          <FormattedMessage
            id="backgrounds.media.showNewMedia"
            defaultMessage="Show new media"
            description="Label for the setting that controls how often new media is shown"
          />
        }
      />
      <label>
        <FormattedMessage
          id="backgrounds.media.sortOrder"
          defaultMessage="Sort order"
          description="Label for selecting media display order"
        />
        <select
          value={data.sortOrder}
          onChange={(event) =>
            setData({
              ...data,
              sortOrder: event.target.value as "sequence" | "random",
            })
          }
        >
          <option value="sequence">
            <FormattedMessage
              id="backgrounds.media.sortOrderSequence"
              defaultMessage="In sequence"
              description="Option label to show uploaded media in original order"
            />
          </option>
          <option value="random">
            <FormattedMessage
              id="backgrounds.media.sortOrderRandom"
              defaultMessage="Random"
              description="Option label to show uploaded media in random order"
            />
          </option>
        </select>
      </label>
      <label>
        <input
          accept=".mp4, .webm, .ogg, image/*"
          multiple={true}
          onChange={(event) =>
            event.target.files && addMedia(event.target.files)
          }
          type="file"
        />
      </label>
      <p className="info media-count">
        <FormattedMessage
          id="backgrounds.media.uploadCount"
          defaultMessage="{count} media uploaded."
          values={{ count: (cache.items || []).length }}
          description="Displays the number of currently uploaded media files"
        />{" "}
        <a className="link" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? (
            <FormattedMessage {...messages.collapse} />
          ) : (
            <FormattedMessage {...messages.expand} />
          )}
        </a>
      </p>
      <div className="grid">
        {isExpanded &&
          urls &&
          urls.map((url, index) => {
            const media = cache.items[index];
            if (!media) return null;

            const isVideo = media.type.match(/^video\/(mp4|webm|ogg)$/);
            return (
              <div className="preview" key={index}>
                {isVideo ? (
                  <video controls src={url} style={{ width: "100%" }} />
                ) : (
                  <img src={url} />
                )}
                <IconButton
                  onClick={() => removeMedia(index)}
                  title={intl.formatMessage(messages.removeMedia)}
                >
                  <RemoveIcon />
                </IconButton>
              </div>
            );
          })}
      </div>
      {largeMedia && (
        <p className="info" style={{ marginTop: "5px" }}>
          <FormattedMessage
            id="backgrounds.media.performanceWarning"
            defaultMessage="Large media may affect performance."
            description="Warning text indicating that large media files may slow down the extension"
          />
        </p>
      )}
      <p className="info">
        <FormattedMessage
          id="backgrounds.media.syncWarning"
          defaultMessage="Media does not sync between devices."
          description="Warning text indicating that custom media files are not synced using browser sync"
        />
      </p>
      <label>
        <input
          type="checkbox"
          checked={data.showControls}
          onChange={(event) =>
            setData({ ...data, showControls: event.target.checked })
          }
        />{" "}
        <FormattedMessage {...backgroundMessages.showControls} />
      </label>
    </div>
  );
};

export default ImageSettings;
