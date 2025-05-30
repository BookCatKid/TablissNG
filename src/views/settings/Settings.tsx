import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { UiContext } from "../../contexts/ui";
import { exportStore, importStore, resetStore } from "../../db/action";
import { useKeyPress } from "../../hooks";
import { Icon } from "@iconify/react";
import Logo from "../shared/Logo";
import Background from "./Background";
import Persist from "./Persist";
import "./Settings.sass";
import System from "./System";
import Widgets from "./Widgets";
import GitHubButton from "react-github-btn";
import { db } from "../../db/state";
import { useKey } from "../../lib/db/react";
import { useTheme } from "../../hooks";

const Settings: React.FC = () => {
  const { toggleSettings } = React.useContext(UiContext);
  const [settingsIconPosition] = useKey(db, "settingsIconPosition");
  const { isDark } = useTheme();
  const intl = useIntl();

  const settingsOnRight =
    settingsIconPosition === "bottomRight" ||
    settingsIconPosition === "topRight";

  const handleReset = () => {
    if (
      confirm(
        intl.formatMessage({
          id: "settings.reset.confirm",
          defaultMessage: "Are you sure you want to delete all of your TablissNG settings? This cannot be undone.",
          description: "Confirmation message when resetting settings"
        })
      )
    )
      resetStore();
  };

  const handleExport = () => {
    const json = exportStore();
    const url = URL.createObjectURL(
      new Blob([json], { type: "application/json" }),
    );

    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    a.href = url;
    a.download = "tablissng.json";
    a.download = "tablissng.json";
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.style.display = "none";
    input.type = "file";
    input.addEventListener("change", function () {
      if (this.files) {
        const file = this.files[0];
        const reader = new FileReader();
        reader.addEventListener("load", (event) => {
          if (event.target && event.target.result) {
            try {
              const state = JSON.parse(event.target.result as string);
              importStore(state);
            } catch (error) {
              alert(
                `Invalid import file: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`,
              );
            }
          }
        });
        reader.readAsText(file);
      }
      document.body.removeChild(input);
    });
    input.click();
  };

  useKeyPress(toggleSettings, ["Escape"]);

  return (
    <div className="Settings">
      <a onClick={toggleSettings} className="fullscreen" />

      <div
        className="plane"
        style={{
          left: settingsOnRight ? "auto" : 0,
          right: settingsOnRight ? 0 : "auto",
          borderRadius: settingsOnRight ? "1rem 0 0 1rem" : "0 1rem 1rem 0",
        }}
      >
        <Logo />
        <div
          style={{
            textAlign: "center",
            margin: "-0.5rem 0 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              background: isDark ? "#2d2d2d" : "#f0f0f0",
              padding: "0.3rem 0.8rem",
              borderRadius: "1rem",
              fontSize: "0.9rem",
              color: isDark ? "#e0e0e0" : "#666",
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <Icon icon="feather:tag" style={{ fontSize: "0.9em" }} />
            TablissNG v{VERSION} {DEV ? "DEV " : ""}
          </span>
        </div>
        <p style={{ textAlign: "center", marginTop: 0, marginBottom: 0 }}>
          <GitHubButton
            href="https://github.com/BookCatKid/tablissNG/subscription"
            data-icon="octicon-eye"
            data-size="large"
            data-show-count="true"
            data-color-scheme={isDark ? "dark" : "light"}
            aria-label="Watch BookCatKid/tablissNG on GitHub"
          >
            <FormattedMessage
              id="settings.github.watch"
              defaultMessage="Watch"
              description="GitHub Watch button text"
            />
          </GitHubButton>
          <span style={{ margin: "0 1rem" }} />
          <GitHubButton
            href="https://github.com/BookCatKid/tablissNG"
            data-icon="octicon-star"
            data-size="large"
            data-show-count="true"
            data-color-scheme={isDark ? "dark" : "light"}
            aria-label="Star BookCatKid/tablissNG on GitHub"
          >
            <FormattedMessage
              id="settings.github.star"
              defaultMessage="Star"
              description="GitHub Star button text"
            />
          </GitHubButton>
        </p>
        <Background />
        <Widgets />
        <System />
        <p style={{ marginBottom: "2rem" }}>
          <a onClick={handleImport}>
            <FormattedMessage
              id="settings.import"
              defaultMessage="Import"
              description="Import title"
            />
          </a>
          ,{" "}
          <a onClick={handleExport}>
            <FormattedMessage
              id="settings.export"
              defaultMessage="export"
              description="Export title"
            />
          </a>{" "}
          <FormattedMessage
            id="settings.or"
            defaultMessage="or"
            description="your settings title"
          />{" "}
          <a onClick={handleReset}>
            <FormattedMessage
              id="settings.reset"
              defaultMessage="reset"
              description="Reset title"
            />
          </a>{" "}
          <FormattedMessage
            id="settings.description"
            defaultMessage="your settings"
            description="your settings title"
          />
        </p>
        <Persist />
        <div style={{ textAlign: "center" }} className="Widget">
          <h4><FormattedMessage
          id="support"
          defaultMessage="Support TablissNG"
          description="Support TablissNG button text"
        /></h4>
          <p>
            <a
              href="https://github.com/BookCatKid/tablissNG/"
              target="_blank"
              rel="noopener noreferrer"
              className="button button--primary"
            >
              <Icon icon="feather:github" />{" "}
              <FormattedMessage
                id="settings.support.star"
                defaultMessage="Star the github repository! 🌟😍"
                description="Call to action to star the GitHub repository"
              />
            </a>
          </p>
          <p style={{ marginTop: "1rem" }} className="Widget">
            <a
              href="https://github.com/BookCatKid/tablissNG/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
              className="button button--primary"
            >
              <Icon icon="feather:code" />{" "}
              <FormattedMessage
                id="settings.support.contribute"
                defaultMessage="Contribute to the project! 😍🌟"
                description="Call to action to contribute to the project"
              />
            </a>
          </p>
        </div>

        <FormattedMessage
          id="settings.translationCredits"
          description="Give yourself some credit :)"
          defaultMessage=" "
          tagName="p"
        />
      </div>
    </div>
  );
};

export default React.memo(Settings);
