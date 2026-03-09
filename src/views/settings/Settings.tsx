import React, { useState, useEffect, useRef } from "react";
import { FormattedMessage, useIntl, defineMessages } from "react-intl";
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

const messages = defineMessages({
  scrollToTop: {
    id: "settings.scrollToTop",
    defaultMessage: "Scroll to top",
    description: "Tooltip for scroll to top button",
  },
  resetConfirm: {
    id: "settings.reset.confirm",
    defaultMessage:
      "Are you sure you want to delete all of your TablissNG settings? This cannot be undone.",
    description: "Confirmation message when resetting settings",
  },
});

const Settings: React.FC = () => {
  const { toggleSettings } = React.useContext(UiContext);
  const [settingsIconPosition] = useKey(db, "settingsIconPosition");
  const [autoHideSettings] = useKey(db, "autoHideSettings");
  const { isDark } = useTheme();
  const intl = useIntl();
  const [isHovered, setIsHovered] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const planeRef = useRef<HTMLDivElement>(null);

  const settingsOnRight =
    settingsIconPosition === "bottomRight" ||
    settingsIconPosition === "topRight";

  useEffect(() => {
    setIsHovered(true);
  }, [toggleSettings]);

  const handleScroll = () => {
    if (planeRef.current) {
      setShowScrollTop(planeRef.current.scrollTop > 200);
    }
  };

  const scrollToTop = () => {
    if (planeRef.current) {
      planeRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleReset = () => {
    if (confirm(intl.formatMessage(messages.resetConfirm))) resetStore();
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

      {autoHideSettings && (
        <div
          className="settings-hover-area"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "330px",
            left: settingsOnRight ? "auto" : 0,
            right: settingsOnRight ? 0 : "auto",
            borderRadius: settingsOnRight ? "1rem 0 0 1rem" : "0 1rem 1rem 0",
            background: isDark
              ? "rgba(45, 45, 45, 0.25)"
              : "rgba(0, 0, 0, 0.25)",
            transition: "background 0.3s ease",
          }}
          onMouseEnter={() => setIsHovered(true)}
        />
      )}

      <div
        ref={planeRef}
        className="plane"
        style={{
          left: settingsOnRight ? "auto" : 0,
          right: settingsOnRight ? 0 : "auto",
          borderRadius: settingsOnRight ? "1rem 0 0 1rem" : "0 1rem 1rem 0",
          opacity: !autoHideSettings || isHovered ? 1 : 0,
          visibility: !autoHideSettings || isHovered ? "visible" : "hidden",
          transition: "opacity 0.3s ease, visibility 0.3s ease",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onScroll={handleScroll}
        onMouseLeave={() => setIsHovered(false)}
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
              background: "var(--bg-input)",
              padding: "0.3rem 0.8rem",
              borderRadius: "1rem",
              fontSize: "0.9rem",
              color: "var(--text-main)",
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
        {/* Only relevant for the web build where IndexedDB may be evicted. Hide for extension builds to avoid confusing prompts in Firefox/Chromium. */}
        {BUILD_TARGET === "web" && <Persist />}

        <div style={{ textAlign: "center" }} className="Widget">
          <h4>
            <FormattedMessage
              id="support"
              defaultMessage="Support TablissNG"
              description="Support TablissNG button text"
            />
          </h4>

          {React.useMemo(
            () => (
              <div
                style={{
                  marginTop: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  width: "100%",
                }}
              >
                <div style={{ width: "100%" }}>
                  <GitHubButton
                    href="https://github.com/BookCatKid/tablissNG"
                    data-icon="octicon-repo"
                    data-size="large"
                    data-show-count="false"
                    data-color-scheme={isDark ? "dark" : "light"}
                    aria-label="Open repository BookCatKid/tablissNG on GitHub"
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.4rem",
                        width: "100%",
                      }}
                    >
                      <Icon icon="feather:code" />{" "}
                      <FormattedMessage
                        id="settings.support.contribute"
                        defaultMessage="Contribute to the project!"
                        description="Call to action to contribute to the project"
                      />
                    </span>
                  </GitHubButton>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    width: "100%",
                  }}
                >
                  <div style={{ flex: 1 }}>
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
                  </div>

                  <div style={{ flex: 1 }}>
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
                  </div>
                </div>
              </div>
            ),
            [isDark],
          )}
        </div>

        <FormattedMessage
          id="settings.translationCredits"
          description="Give yourself some credit :)"
          defaultMessage=" "
          tagName="p"
        />
      </div>

      {showScrollTop && (
        <button
          className={`button button--primary scroll-to-top ${settingsOnRight ? "scroll-to-top--right" : "scroll-to-top--left"}`}
          onClick={scrollToTop}
          title={intl.formatMessage(messages.scrollToTop)}
        >
          <Icon icon="feather:arrow-up" />
        </button>
      )}
    </div>
  );
};

export default React.memo(Settings);
