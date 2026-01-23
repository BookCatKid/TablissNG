import React from "react";
import { selectWidgets } from "../../db/select";
import { db, WidgetPosition, WidgetState } from "../../db/state";
import { useSelector, useValue } from "../../lib/db/react";
import Slot from "./Slot";
import "./Widgets.sass";

const Widgets: React.FC = () => {
  const focus = useValue(db, "focus");
  const widgets = useSelector(db, selectWidgets);

  // NOTE: old todo: (probobly no longer relevent though) (from original maintainer) one day we'll have `Array.groupBy` accepted by tc39

  const grouped: Partial<Record<WidgetPosition, WidgetState[]>> = {};
  const cssWidgets: Partial<Record<WidgetPosition, WidgetState[]>> = {};

  widgets.forEach((widget) => {
    if (widget.key === "widget/css") {
      cssWidgets[widget.display.position] = [
        ...(cssWidgets[widget.display.position] ?? []),
        widget,
      ];
    } else {
      grouped[widget.display.position] = [
        ...(grouped[widget.display.position] ?? []),
        widget,
      ];
    }
  });

  const slots = Object.entries(grouped) as [WidgetPosition, WidgetState[]][];
  const cssSlots = Object.entries(cssWidgets) as [
    WidgetPosition,
    WidgetState[],
  ][];

  return (
    <div className="Widgets fullscreen">
      <div className="container">
        {!focus &&
          slots.map(([position, widgets]) => (
            <Slot key={position} position={position} widgets={widgets} />
          ))}
        {cssSlots.map(([position, widgets]) => (
          <Slot key={`css-${position}`} position={position} widgets={widgets} />
        ))}
      </div>
    </div>
  );
};

export default Widgets;
