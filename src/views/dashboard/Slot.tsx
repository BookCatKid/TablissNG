import "./Slot.sass";

import type { FC } from "react";

import { WidgetPosition, WidgetState } from "../../db/state";
import { getConfig } from "../../plugins";
import Plugin from "../shared/Plugin";
import Widget from "./Widget";

type Props = {
  position: WidgetPosition;
  widgets: WidgetState[];
};

const Slot: FC<Props> = ({ position, widgets }) => (
  <div className={`Slot ${position}`}>
    {widgets.map(({ display, id, key }) => (
      <Widget key={id} id={id} {...display}>
        <Plugin id={id} component={getConfig(key).dashboardComponent} />
      </Widget>
    ))}
  </div>
);

export default Slot;
