import type { FC } from "react";
import { useMemo } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";

import { setBackground } from "../../db/action";
import { BackgroundDisplay, BackgroundPosition, db } from "../../db/state";
import { useKey } from "../../lib/db/react";
import { sectionMessages } from "../../locales/messages";
import { backgroundConfigs, getConfig } from "../../plugins";
import Plugin from "../shared/Plugin";
import ToggleSection from "../shared/ToggleSection";

const messages = defineMessages({
  lighten: {
    id: "backgrounds.display.lighten",
    defaultMessage: "Lighten",
    description: "Label for maximum luminosity",
  },
  darken: {
    id: "backgrounds.display.darken",
    defaultMessage: "Darken",
    description: "Label for minimum luminosity",
  },
});

const Background: FC = () => {
  const [data, setData] = useKey(db, "background");
  const intl = useIntl();
  const plugin = getConfig(data.key);

  const sortedBackgroundConfigs = useMemo(() => {
    return [...backgroundConfigs].sort((a, b) => {
      const nameA = intl.formatMessage(a.name);
      const nameB = intl.formatMessage(b.name);
      return nameA.localeCompare(nameB);
    });
  }, [intl]);

  const setBackgroundDisplay = (display: BackgroundDisplay): void => {
    setData({ ...data, display: { ...data.display, ...display } });
  };

  return (
    <div>
      <h2>
        <FormattedMessage
          id="background"
          defaultMessage="Background"
          description="Background title"
        />
      </h2>

      <label>
        <select
          value={data.key}
          onChange={(event) => setBackground(event.target.value)}
          className="primary"
        >
          {sortedBackgroundConfigs.map((plugin) => (
            <option key={plugin.key} value={plugin.key}>
              <FormattedMessage {...plugin.name} />
            </option>
          ))}
        </select>
      </label>

      {plugin && (
        <div className="Widget">
          <h4>
            <FormattedMessage {...plugin.name} />
          </h4>

          {plugin.settingsComponent && (
            <div className="settings">
              <Plugin id={data.id} component={plugin.settingsComponent} />
            </div>
          )}

          {plugin.supportsBackdrop && (
            <ToggleSection
              name={intl.formatMessage(sectionMessages.displaySettings)}
            >
              <>
                <label>
                  <FormattedMessage
                    id="backgrounds.display.blur"
                    defaultMessage="Blur"
                    description="Label for blur slider"
                  />{" "}
                  <br />
                  <input
                    type="range"
                    list="blur-markers"
                    min="0"
                    max="50"
                    step="2"
                    value={data.display.blur}
                    onChange={(event) =>
                      setBackgroundDisplay({
                        blur: Number(event.target.value),
                      })
                    }
                  />
                  <datalist id="blur-markers">
                    <option value="0" />
                    <option value="50" />
                  </datalist>
                </label>

                <label>
                  <FormattedMessage
                    id="backgrounds.display.luminosity"
                    defaultMessage="Luminosity"
                    description="Label for luminosity slider"
                  />{" "}
                  <br />
                  <input
                    type="range"
                    list="luminosity-markers"
                    min="-1"
                    max="1"
                    step="0.1"
                    value={data.display.luminosity}
                    onChange={(event) =>
                      setBackgroundDisplay({
                        luminosity: Number(event.target.value),
                      })
                    }
                  />
                  <datalist id="luminosity-markers">
                    <option
                      value="-1"
                      label={intl.formatMessage(messages.darken)}
                    />
                    <option value="0" />
                    <option
                      value="1"
                      label={intl.formatMessage(messages.lighten)}
                    />
                  </datalist>
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={data.display.scale ?? true}
                    onChange={(e) => {
                      setBackgroundDisplay({
                        scale: e.target.checked,
                      });
                    }}
                  />{" "}
                  <FormattedMessage
                    id="backgrounds.display.scale"
                    defaultMessage="Scale background to fit"
                    description="Label for scale background checkbox"
                  />
                </label>

                <label>
                  <FormattedMessage
                    id="backgrounds.position"
                    defaultMessage="Position"
                    description="Label for background position selection"
                  />{" "}
                  <br />
                  <select
                    value={data.display.position ?? "center"}
                    onChange={(e) => {
                      setBackgroundDisplay({
                        position: e.target.value as BackgroundPosition,
                      });
                    }}
                  >
                    <option value="center">
                      <FormattedMessage
                        id="backgrounds.position.center"
                        defaultMessage="Center"
                        description="Center background position"
                      />
                    </option>
                    <option value="top">
                      <FormattedMessage
                        id="backgrounds.position.top"
                        defaultMessage="Top"
                        description="Top background position"
                      />
                    </option>
                    <option value="bottom">
                      <FormattedMessage
                        id="backgrounds.position.bottom"
                        defaultMessage="Bottom"
                        description="Bottom background position"
                      />
                    </option>
                    <option value="left">
                      <FormattedMessage
                        id="backgrounds.position.left"
                        defaultMessage="Left"
                        description="Left background position"
                      />
                    </option>
                    <option value="right">
                      <FormattedMessage
                        id="backgrounds.position.right"
                        defaultMessage="Right"
                        description="Right background position"
                      />
                    </option>
                    <option value="top left">
                      <FormattedMessage
                        id="backgrounds.position.topLeft"
                        defaultMessage="Top Left"
                        description="Top left background position"
                      />
                    </option>
                    <option value="top right">
                      <FormattedMessage
                        id="backgrounds.position.topRight"
                        defaultMessage="Top Right"
                        description="Top right background position"
                      />
                    </option>
                    <option value="bottom left">
                      <FormattedMessage
                        id="backgrounds.position.bottomLeft"
                        defaultMessage="Bottom Left"
                        description="Bottom left background position"
                      />
                    </option>
                    <option value="bottom right">
                      <FormattedMessage
                        id="backgrounds.position.bottomRight"
                        defaultMessage="Bottom Right"
                        description="Bottom right background position"
                      />
                    </option>
                  </select>
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={data.display.nightDim}
                    onChange={(e) => {
                      setBackgroundDisplay({
                        nightDim: e.target.checked,
                      });
                    }}
                  />{" "}
                  <FormattedMessage
                    id="backgrounds.display.nightDim"
                    defaultMessage="Automatically dim at night"
                    description="Label for night dim checkbox"
                  />
                </label>

                {data.display.nightDim && (
                  <>
                    <label>
                      <FormattedMessage
                        id="backgrounds.display.nightStart"
                        defaultMessage="Night starts at"
                        description="Label for night start time input"
                      />{" "}
                      <br />
                      <input
                        type="time"
                        value={data.display.nightStart}
                        onChange={(e) => {
                          setBackgroundDisplay({
                            nightStart: e.target.value,
                          });
                        }}
                      />
                    </label>

                    <label>
                      <FormattedMessage
                        id="backgrounds.display.nightEnd"
                        defaultMessage="Night ends at"
                        description="Label for night end time input"
                      />{" "}
                      <br />
                      <input
                        type="time"
                        value={data.display.nightEnd}
                        onChange={(e) => {
                          setBackgroundDisplay({
                            nightEnd: e.target.value,
                          });
                        }}
                      />
                    </label>
                  </>
                )}
              </>
            </ToggleSection>
          )}
        </div>
      )}
    </div>
  );
};

export default Background;
