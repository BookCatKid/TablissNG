import React from "react";
import { useTheme } from "../../hooks";
import Background from "./Background";
import "./Dashboard.sass";
import Overlay from "./Overlay";
import Widgets from "./Widgets";

const Dashboard: React.FC = () => {
  const { isDark } = useTheme();
  const theme = isDark ? "dark" : "";

  return (
    <div className={`Dashboard fullscreen ${theme}`}>
      <Background />
      <Widgets />
      <Overlay />
    </div>
  );
};

export default React.memo(Dashboard);
