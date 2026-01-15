import React, { useState } from "react";
import { FormattedMessage, useIntl, defineMessages } from "react-intl";
import { useObjectUrls } from "../../../hooks";
import { IconButton, RemoveIcon } from "../../../views/shared";
import "./MediaSettings.sass";
import { defaultCache, Props } from "./types";

const messages = defineMessages({
  removeMedia: {
    id: "backgrounds.media.removeMedia",
    defaultMessage: "Remove media",
    description: "Title for remove media button",
  },
});

const ImageSettings: React.FC<Props> = ({ cache = defaultCache, setCache }) => {
  const intl = useIntl();
  const urls = useObjectUrls(cache);
  const [isExpanded, setIsExpanded] = useState(false);

  const addMedia = (files: FileList) =>
    setCache(
      cache.concat(
        Array.from(files).filter(
          (file) =>
            file.type.match(/^video\/(mp4|webm|ogg)$/) ||
            file.type.match(/^image\//),
        ),
      ),
    );

  const removeMedia = (index: number) =>
    setCache(cache.filter((_, i) => index !== i));

  const largeMedia = cache.some((media) => media.size > 2097152);

  return (
    <div className="MediaSettings">
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
          values={{ count: cache.length }}
        />{" "}
        <a className="link" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? "Collapse" : "Expand"}
        </a>
      </p>

      <div className="grid">
        {isExpanded &&
          urls &&
          urls.map((url, index) => {
            const media = cache[index];
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
          />
        </p>
      )}

      <p className="info">
        <FormattedMessage
          id="backgrounds.media.syncWarning"
          defaultMessage="Media does not sync between devices."
        />
      </p>
    </div>
  );
};

export default ImageSettings;
