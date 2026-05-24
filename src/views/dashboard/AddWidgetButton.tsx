import "./AddWidgetButton.sass";

import { Icon } from "@iconify/react";
import React from "react";
import { useIntl } from "react-intl";

import { UiContext } from "../../contexts/ui";
import { addWidget } from "../../db/action";
import { sectionMessages } from "../../locales/messages";
import { widgetConfigs } from "../../plugins/plugins";
import { isCustomCodeWidget } from "../../plugins/widgets/customCode";
import { isTextWidget } from "../../plugins/widgets/textWidgets";

const AddWidgetButton: React.FC = () => {
  const intl = useIntl();
  const { addWidgetOpen, closeAddWidget, openCodeEditor, openTextEditor } =
    React.useContext(UiContext);

  const sortedWidgetConfigs = React.useMemo(() => {
    return [...widgetConfigs].sort((a, b) => {
      const nameA = intl.formatMessage(a.name);
      const nameB = intl.formatMessage(b.name);
      return nameA.localeCompare(nameB);
    });
  }, [intl]);

  const handleAddWidget = (key: string) => {
    const widgetId = addWidget(key);
    closeAddWidget();
    if (isTextWidget(key)) {
      openTextEditor(widgetId, key);
    } else if (isCustomCodeWidget(key)) {
      openCodeEditor(widgetId, key);
    }
  };

  React.useEffect(() => {
    if (!addWidgetOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAddWidget();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addWidgetOpen, closeAddWidget]);

  if (!addWidgetOpen) {
    return null;
  }

  return (
    <div className="AddWidgetButton" aria-live="polite">
      <div className="backdrop" onClick={closeAddWidget} />
      <div
        className="widget-menu"
        role="dialog"
        aria-modal="true"
        aria-label={intl.formatMessage({
          id: "add.new.widget",
          defaultMessage: "Add a new widget",
          description: "Add a new widget button text",
        })}
      >
        <div className="widget-menu-header">
          <h3>
            {intl.formatMessage({
              id: "add.new.widget",
              defaultMessage: "Add a new widget",
              description: "Add a new widget button text",
            })}
          </h3>
          <button
            className="close-btn"
            onClick={closeAddWidget}
            aria-label={intl.formatMessage(sectionMessages.close)}
          >
            <Icon icon="feather:x" />
          </button>
        </div>
        <div className="widget-list">
          {sortedWidgetConfigs.map((plugin) => (
            <button
              key={plugin.key}
              className="widget-option"
              onClick={() => handleAddWidget(plugin.key)}
            >
              <div className="widget-name">
                {intl.formatMessage(plugin.name)}
              </div>
              {plugin.description ? (
                <div className="widget-desc">
                  {intl.formatMessage(plugin.description)}
                </div>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddWidgetButton;
