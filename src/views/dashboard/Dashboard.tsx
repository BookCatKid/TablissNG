import React from "react";
import { useTheme } from "../../hooks";
import { useKey } from "../../lib/db/react";
import { db } from "../../db/state";
import Background from "./Background";
import "./Dashboard.sass";
import Overlay from "./Overlay";
import Widgets from "./Widgets";

const Dashboard: React.FC = () => {
  const { isDark } = useTheme();
  const theme = isDark ? "dark" : "";
  const [settingsIconPosition] = useKey(db, "settingsIconPosition");

  return (
    <div className={`Dashboard fullscreen ${theme} ${settingsIconPosition}`}>
      <Background />
      <Widgets />
      <Overlay />
    </div>
  );
};

export default React.memo(Dashboard);
