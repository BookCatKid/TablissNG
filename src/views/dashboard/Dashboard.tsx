import "./Dashboard.sass";

import { type FC, memo, useEffect, useState } from "react";

import { db } from "../../db/state";
import { useTheme } from "../../hooks";
import { useKey } from "../../lib/db/react";
import { runWhenIdle } from "../../utils";
import Background from "./Background";
import Overlay from "./Overlay";
import Widgets from "./Widgets";

const Dashboard: FC = () => {
  const { isDark } = useTheme();
  const theme = isDark ? "dark" : "";
  const [settingsIconPosition] = useKey(db, "settingsIconPosition");
  const [showWidgets, setShowWidgets] = useState(false);

  useEffect(() => {
    return runWhenIdle(() => setShowWidgets(true), {
      delay: 100,
      timeout: 2000,
    });
  }, []);

  return (
    <div className={`Dashboard fullscreen ${theme} ${settingsIconPosition}`}>
      <Background />
      {showWidgets && <Widgets />}
      <Overlay />
    </div>
  );
};

export default memo(Dashboard);
