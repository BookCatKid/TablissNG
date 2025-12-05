import React from "react";
import { WidgetPosition, WidgetState } from "../../db/state";
import { getConfig } from "../../plugins";
import Plugin from "../shared/Plugin";
import "./Slot.sass";
import Widget from "./Widget";

type Props = {
  position: WidgetPosition;
  widgets: WidgetState[];
};

const Slot: React.FC<Props> = ({ position, widgets }) => (
  <div className={`Slot ${position}`}>
    {widgets.map((widget) => (
      <Widget
        key={widget.id}
        id={widget.id}
        widgetKey={widget.key}
        {...widget.display}
      >
        <Plugin
          id={widget.id}
          component={getConfig(widget.key).dashboardComponent}
        />
      </Widget>
    ))}
  </div>
);

export default Slot;
