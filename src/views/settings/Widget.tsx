import React from "react";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";
import { setWidgetDisplay } from "../../db/action";
import { WidgetState } from "../../db/state";
import { useToggle } from "../../hooks";
import { getConfig } from "../../plugins";
import { sectionMessages } from "../../locales/messages";
import { DownIcon, Icon, IconButton, RemoveIcon, UpIcon } from "../shared";
import PluginContainer from "../shared/Plugin";
import ToggleSection from "../shared/ToggleSection";
import "./Widget.sass";
import WidgetDisplay from "./WidgetDisplay";

// Define messages used in props/attributes
const messages = defineMessages({
  removeWidget: {
    id: "settings.actions.remove",
    defaultMessage: "Remove widget",
    description: "Button title for removing a widget",
  },
  editSettings: {
    id: "settings.actions.editSettings",
    defaultMessage: "Edit widget settings",
    description: "Button title for editing widget settings",
  },
  closeSettings: {
    id: "settings.actions.closeSettings",
    defaultMessage: "Close widget settings",
    description: "Button title for closing widget settings",
  },
  moveDown: {
    id: "settings.actions.moveDown",
    defaultMessage: "Move widget down",
    description: "Button title for moving widget down",
  },
  moveUp: {
    id: "settings.actions.moveUp",
    defaultMessage: "Move widget up",
    description: "Button title for moving widget up",
  },
});

interface Config {
  name: { id: string; defaultMessage: string };
  description: { id: string; defaultMessage: string };
  settingsComponent?: React.ComponentType<any>;
}

interface Props {
  plugin: WidgetState;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove: () => void;
}

const Widget: React.FC<Props> = ({
  plugin,
  onMoveDown,
  onMoveUp,
  onRemove,
}) => {
  const [isOpen, toggleIsOpen] = useToggle(onRemove === undefined);
  const intl = useIntl();

  const { description, name, settingsComponent } = getConfig(plugin.key);

  const setDisplay = setWidgetDisplay.bind(null, plugin.id);

  return (
    <fieldset className="Widget">
      <div className="title--buttons">
        <IconButton
          onClick={onRemove}
          title={intl.formatMessage(messages.removeWidget)}
        >
          <RemoveIcon />
        </IconButton>

        <IconButton
          onClick={toggleIsOpen}
          title={intl.formatMessage(
            isOpen ? messages.closeSettings : messages.editSettings,
          )}
        >
          <Icon name="settings" />
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

        <h4 onClick={toggleIsOpen}>
          <FormattedMessage {...name} />
        </h4>
        {!isOpen && (
          <p>
            <FormattedMessage {...description} />
          </p>
        )}
      </div>

      {isOpen && (
        <div>
          {settingsComponent && (
            <div className="settings">
              <PluginContainer id={plugin.id} component={settingsComponent} />
            </div>
          )}

          <ToggleSection
            name={intl.formatMessage(sectionMessages.displaySettings)}
          >
            <WidgetDisplay display={plugin.display} onChange={setDisplay} />
          </ToggleSection>

          <ToggleSection
            name={intl.formatMessage(sectionMessages.fontSettings)}
          >
            <>
              <label>
                <FormattedMessage
                  id="settings.font.family"
                  defaultMessage="Font"
                  description="Font title"
                />{" "}
                <br />
                <input
                  type="text"
                  value={plugin.display.fontFamily}
                  onChange={(event) =>
                    setDisplay({ fontFamily: event.target.value })
                  }
                />
              </label>

              <label>
                <FormattedMessage
                  id="settings.font.weight"
                  defaultMessage="Weight"
                  description="Weight title"
                />{" "}
                <br />
                <select
                  value={plugin.display.fontWeight}
                  onChange={(event) =>
                    setDisplay({
                      fontWeight: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    })
                  }
                >
                  <option value="">
                    <FormattedMessage
                      id="settings.font.default"
                      defaultMessage="Default"
                      description="Default weight font"
                    />
                  </option>
                  <option value="100">
                    <FormattedMessage
                      id="settings.font.thin"
                      defaultMessage="Thin"
                      description="Thin weight font"
                    />
                  </option>
                  <option value="300">
                    <FormattedMessage
                      id="settings.font.light"
                      defaultMessage="Light"
                      description="Light weight font"
                    />
                  </option>
                  <option value="400">
                    <FormattedMessage
                      id="settings.font.regular"
                      defaultMessage="Regular"
                      description="Regular weight font"
                    />
                  </option>
                  <option value="500">
                    <FormattedMessage
                      id="settings.font.medium"
                      defaultMessage="Medium"
                      description="Medium weight font"
                    />
                  </option>
                  <option value="700">
                    <FormattedMessage
                      id="settings.font.bold"
                      defaultMessage="Bold"
                      description="Bold weight font"
                    />
                  </option>
                  <option value="900">
                    <FormattedMessage
                      id="settings.font.black"
                      defaultMessage="Black"
                      description="Black weight font"
                    />
                  </option>
                </select>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={plugin.display.fontStyle === "italic"}
                  onChange={(event) =>
                    setDisplay({
                      fontStyle: event.target.checked ? "italic" : "normal",
                    })
                  }
                />{" "}
                <FormattedMessage
                  id="settings.font.italic"
                  defaultMessage="Italic"
                  description="Italic font style option"
                />
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={plugin.display.textDecoration === "underline"}
                  onChange={(event) =>
                    setDisplay({
                      textDecoration: event.target.checked
                        ? "underline"
                        : "none",
                    })
                  }
                />{" "}
                <FormattedMessage
                  id="settings.font.underline"
                  defaultMessage="Underline"
                  description="Underline text decoration option"
                />
              </label>

              <label>
                <FormattedMessage
                  id="colour"
                  defaultMessage="Colour"
                  description="Colour title"
                />{" "}
                <br />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <input
                    type="color"
                    value={plugin.display.colour ?? "#ffffff"}
                    onChange={(event) =>
                      setDisplay({ colour: event.target.value })
                    }
                    disabled={plugin.display.useAccentColor}
                    style={{ opacity: plugin.display.useAccentColor ? 0.5 : 1 }}
                  />
                  <label
                    style={{
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={plugin.display.useAccentColor ?? false}
                      onChange={(event) =>
                        setDisplay({ useAccentColor: event.target.checked })
                      }
                    />
                    <FormattedMessage
                      id="settings.useAccentColor"
                      defaultMessage="Use Accent Color"
                      description="Use global accent color for widget text"
                    />
                  </label>
                </div>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={plugin.display.textOutline}
                  onChange={(event) =>
                    setDisplay({ textOutline: event.target.checked })
                  }
                />{" "}
                <FormattedMessage
                  id="settings.textOutline"
                  defaultMessage="Text outline"
                />
              </label>

              {plugin.display.textOutline && (
                <>
                  <label>
                    <FormattedMessage
                      id="settings.outlineStyle"
                      defaultMessage="Outline Style"
                    />
                    <select
                      value={plugin.display.textOutlineStyle ?? "basic"}
                      onChange={(event) =>
                        setDisplay({
                          textOutlineStyle: event.target.value as
                            | "basic"
                            | "advanced",
                        })
                      }
                    >
                      <option value="basic">
                        <FormattedMessage
                          id="settings.basicOutline"
                          defaultMessage="Basic (Text Shadow)"
                        />
                      </option>
                      <option value="advanced">
                        <FormattedMessage
                          id="settings.advancedOutline"
                          defaultMessage="Advanced (Stroke)"
                        />
                      </option>
                    </select>
                  </label>

                  <p>
                    <FormattedMessage
                      id="settings.basicModeDescription"
                      defaultMessage="Basic mode uses a text shadow that can only have one size."
                    />
                  </p>
                  <p>
                    <FormattedMessage
                      id="settings.advancedModeDescription"
                      defaultMessage="Advanced mode uses a second element with a text stroke and allows any size."
                    />
                  </p>

                  <label>
                    <FormattedMessage
                      id="settings.outlineColor"
                      defaultMessage="Outline Color"
                    />
                    <input
                      type="color"
                      value={plugin.display.textOutlineColor ?? "#000000"}
                      onChange={(event) =>
                        setDisplay({ textOutlineColor: event.target.value })
                      }
                    />
                  </label>

                  {plugin.display.textOutlineStyle === "advanced" && (
                    <label>
                      <FormattedMessage
                        id="settings.outlineSize"
                        defaultMessage="Outline Size"
                      />
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={plugin.display.textOutlineSize ?? 1}
                        onChange={(event) =>
                          setDisplay({
                            textOutlineSize: Number(event.target.value),
                          })
                        }
                      />
                    </label>
                  )}
                </>
              )}
            </>
          </ToggleSection>
        </div>
      )}
    </fieldset>
  );
};

export default Widget;
