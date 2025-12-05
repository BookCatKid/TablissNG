import React from "react";
import { db } from "../../db/state";
import { useValue } from "../../lib/db/react";
import { getConfig } from "../../plugins";
import Plugin from "../shared/Plugin";
import "./Background.sass";

const Background: React.FC = () => {
  const background = useValue(db, "background");
  const { dashboardComponent } = getConfig(background.key);

  return (
    <div className="Background">
      <div className="Background-plugin">
        <Plugin id={background.id} component={dashboardComponent} />
      </div>
    </div>
  );
};

export default Background;
