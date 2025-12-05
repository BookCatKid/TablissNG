import React from "react";
import { useTheme } from "../../hooks";
import Background from "./Background";
import "./Dashboard.sass";
import Overlay from "./Overlay";
import Widgets from "./Widgets";
import AddWidgetButton from "./AddWidgetButton";
import CustomCodeEditor from "./CustomCodeEditor";
import TextWidgetEditor from "./TextWidgetEditor";

const baseClasses = ["Dashboard", "fullscreen"];

const Dashboard: React.FC = () => {
  const { isDark } = useTheme();
  const className = [...baseClasses, isDark ? "dark" : null].filter(Boolean).join(" ");

  return (
    <div className={className}>
      <Background />
      <Widgets />
      <AddWidgetButton />
      <TextWidgetEditor />
      <CustomCodeEditor />
      <Overlay />
    </div>
  );
};

export default React.memo(Dashboard);
