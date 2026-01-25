import React from "react";
import { FormattedMessage } from "react-intl";
import { WidgetPosition } from "../../db/state";
import { Icon, IconButton } from "../shared";
import "./PositionInput.css";

const positions = [
  {
    value: "topLeft",
    icon: "arrow-up-left",
  },
  {
    value: "topCentre",
    icon: "arrow-up",
  },
  {
    value: "topRight",
    icon: "arrow-up-right",
  },
  {
    value: "middleLeft",
    icon: "arrow-left",
  },
  {
    value: "middleCentre",
    icon: "crosshair",
  },
  {
    value: "middleRight",
    icon: "arrow-right",
  },
  {
    value: "bottomLeft",
    icon: "arrow-down-left",
  },
  {
    value: "bottomCentre",
    icon: "arrow-down",
  },
  {
    value: "bottomRight",
    icon: "arrow-down-right",
  },
  {
    value: "free",
    icon: "move",
  },
] as const;

type Props = {
  value: WidgetPosition;
  onChange: (value: WidgetPosition) => void;
};

const PositionInput: React.FC<Props> = ({ value, onChange }) => (
  <div className="PositionInput">
    <label>
      <FormattedMessage
        id="settings.position"
        defaultMessage="Position"
        description="Position title"
      />
    </label>

    <div className="grid">
      {positions.map((position) => (
        <div key={position.value} className="position-button-container">
          <IconButton
            onClick={() => onChange(position.value)}
            primary={value === position.value}
          >
            <Icon name={position.icon} />
          </IconButton>
        </div>
      ))}
    </div>
  </div>
);

export default PositionInput;
