import React from "react";
import { FormattedMessage } from "react-intl";
import { setWidgetDisplay } from "../../db/action";
import { WidgetState } from "../../db/state";
import { useToggle } from "../../hooks";
import { getConfig } from "../../plugins";
import { DownIcon, Icon, IconButton, RemoveIcon, UpIcon } from "../shared";
import PluginContainer from "../shared/Plugin";
import ToggleSection from "../shared/ToggleSection";
import "./Widget.sass";
import WidgetDisplay from "./WidgetDisplay";

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

  const { description, name, settingsComponent } = getConfig(plugin.key);

  const setDisplay = setWidgetDisplay.bind(null, plugin.id);

  return (
    <fieldset className="Widget">
      <div className="title--buttons">
        <IconButton onClick={onRemove} title="Remove widget">
          <RemoveIcon />
        </IconButton>

        <IconButton
          onClick={toggleIsOpen}
          title={`${isOpen ? "Close" : "Edit"} widget settings`}
        >
          <Icon name="settings" />
        </IconButton>

        {onMoveDown && (
          <IconButton onClick={onMoveDown} title="Move widget down">
            <DownIcon />
          </IconButton>
        )}

        {onMoveUp && (
          <IconButton onClick={onMoveUp} title="Move widget up">
            <UpIcon />
          </IconButton>
        )}

        <h4 onClick={toggleIsOpen}>
          <FormattedMessage {...name} />
        </h4>
        {!isOpen && <p>
          <FormattedMessage {...description} />
        </p>}
      </div>

      {isOpen && (
        <div>
          {settingsComponent && (
            <div className="settings">
              <PluginContainer id={plugin.id} component={settingsComponent} />
            </div>
          )}

          <ToggleSection name="Display Settings">
            <WidgetDisplay display={plugin.display} onChange={setDisplay} />
          </ToggleSection>

          <ToggleSection name="Font Settings">
            <>
              <label>
              <FormattedMessage
          id="font"
          defaultMessage="Font"
          description="Font title"
        /> <br />
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
          id="font.weight"
          defaultMessage="Weight"
          description="Weight title"
        /> <br />
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
                  <option value=""><FormattedMessage
          id="font.default"
          defaultMessage="Default"
          description="Default weight font"
        /></option>
                  <option value="100"><FormattedMessage
          id="font.thin"
          defaultMessage="Thin"
          description="Thin weight font"
        /></option>
                  <option value="300"><FormattedMessage
          id="font.light"
          defaultMessage="Light"
          description="Light weight font"
        /></option>
                  <option value="400"><FormattedMessage
          id="font.regular"
          defaultMessage="Regular"
          description="Regular weight font"
        /></option>
                  <option value="500"><FormattedMessage
          id="font.medium"
          defaultMessage="Medium"
          description="Medium weight font"
        /></option>
                  <option value="700"><FormattedMessage
          id="font.bold"
          defaultMessage="Bold"
          description="Bold weight font"
        /></option>
                  <option value="900"><FormattedMessage
          id="font.black"
          defaultMessage="Black"
          description="Black weight font"
        /></option>
                </select>
              </label>

              <label>
              <FormattedMessage
          id="colour"
          defaultMessage="Colour"
          description="Colour title"
        /> <br />
                <input
                  type="color"
                  value={plugin.display.colour ?? "#ffffff"}
                  onChange={(event) =>
                    setDisplay({ colour: event.target.value })
                  }
                />
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={plugin.display.textOutline}
                  onChange={(event) =>
                    setDisplay({ textOutline: event.target.checked })
                  }
                />{" "}
                Text outline
              </label>

              {plugin.display.textOutline && (
                <>
                  <label>
                    Outline Style
                    <select
                      value={plugin.display.textOutlineStyle ?? "basic"}
                      onChange={(event) =>
                        setDisplay({ textOutlineStyle: event.target.value as "basic" | "advanced" })
                      }
                    >
                      <option value="basic">Basic (Text Shadow)</option>
                      <option value="advanced">Advanced (Stroke)</option>
                    </select>
                  </label>

                  <p>
                    Basic mode uses a text shadow that can only have one size.
                  </p>
                  <p>
                    Advanced mode uses a second element with a text stroke and allows any size.
                  </p>

                  <label>
                    Outline Color
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
                      Outline Size
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={plugin.display.textOutlineSize ?? 1}
                        onChange={(event) =>
                          setDisplay({ textOutlineSize: Number(event.target.value) })
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
