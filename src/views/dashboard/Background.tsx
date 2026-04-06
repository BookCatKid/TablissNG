import type { FC } from "react";

import { db } from "../../db/state";
import { useValue } from "../../lib/db/react";
import { getConfig } from "../../plugins";
import Plugin from "../shared/Plugin";

const Background: FC = () => {
  const background = useValue(db, "background");

  const { dashboardComponent } = getConfig(background.key);

  return (
    <div className="Background">
      <Plugin id={background.id} component={dashboardComponent} />
    </div>
  );
};

export default Background;
