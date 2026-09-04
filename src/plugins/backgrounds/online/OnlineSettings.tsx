import "./OnlineSettings.sass";

import { type FC, useEffect, useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";

import { backgroundMessages } from "../../../locales/messages";
import { DebounceInput } from "../../shared";
import BaseSettings from "../base/BaseSettings";
import { defaultData, Props } from "./types";

const messages = defineMessages({
  jsonPathPlaceholder: {
    id: "backgrounds.online.jsonPath.placeholder",
    defaultMessage: "data.0.path",
    description: "Example path to an image URL in a JSON response",
  },
});

function getOriginPattern(url: string) {
  try {
    const { origin, protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:"
      ? `${origin}/*`
      : undefined;
  } catch {
    return;
  }
}

const OnlineSettings: FC<Props> = ({ data, setCache, setData }) => {
  const intl = useIntl();
  const settings = { ...defaultData, ...data };
  const isJson = settings.responseType === "json";
  const [apiAccess, setApiAccess] = useState<{
    origin: string;
    state: "allowed" | "blocked";
  }>();
  const [requestingPermission, setRequestingPermission] = useState(false);
  const origin = getOriginPattern(settings.url);

  useEffect(() => {
    if (BUILD_TARGET === "web" || !isJson || !origin) return;

    let current = true;
    const checkAccess = async () => {
      try {
        if (await browser.permissions.contains({ origins: [origin] })) {
          if (current) setApiAccess({ origin, state: "allowed" });
          return;
        }

        await fetch(settings.url);
        if (current) setApiAccess({ origin, state: "allowed" });
      } catch {
        if (current) setApiAccess({ origin, state: "blocked" });
      }
    };
    checkAccess();

    return () => {
      current = false;
    };
  }, [isJson, origin, settings.url]);

  const requestApiAccess = async () => {
    if (!origin) return;

    setRequestingPermission(true);
    try {
      const granted = await browser.permissions.request({ origins: [origin] });
      setApiAccess({
        origin,
        state: granted ? "allowed" : "blocked",
      });
      if (granted) setCache(undefined);
    } catch {
      setApiAccess({ origin, state: "blocked" });
    } finally {
      setRequestingPermission(false);
    }
  };

  return (
    <div className="OnlineSettings">
      <label>
        <FormattedMessage
          id="backgrounds.online.url"
          defaultMessage="Image URL"
          description="Image URL title"
        />
        <DebounceInput
          type="text"
          value={settings.url}
          onChange={(value) => setData({ ...settings, url: value })}
          wait={1000}
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={isJson}
          onChange={(event) =>
            setData({
              ...settings,
              responseType: event.target.checked ? "json" : "image",
            })
          }
        />{" "}
        <FormattedMessage
          id="backgrounds.online.parseJson"
          defaultMessage="Parse JSON Response"
          description="Toggle for extracting an image URL from a JSON response"
        />
      </label>

      {isJson && (
        <>
          <label>
            <FormattedMessage
              id="backgrounds.online.jsonPath"
              defaultMessage="JSON Path"
              description="Path to an image URL in a JSON response"
            />
            <DebounceInput
              type="text"
              value={settings.jsonPath}
              placeholder={intl.formatMessage(messages.jsonPathPlaceholder)}
              onChange={(value) => setData({ ...settings, jsonPath: value })}
              wait={1000}
            />
          </label>

          <BaseSettings data={settings} setData={setData} />

          {BUILD_TARGET !== "web" &&
            origin &&
            apiAccess?.origin === origin &&
            apiAccess.state === "blocked" && (
              <div className="cors-permission" role="status">
                <strong>
                  <FormattedMessage
                    id="backgrounds.online.corsBlocked"
                    defaultMessage="API request failed"
                    description="Title shown when a background API request may have been blocked by CORS"
                  />
                </strong>
                <p>
                  <FormattedMessage
                    id="backgrounds.online.corsPermissionDescription"
                    defaultMessage="CORS may be blocking this API. Grant cross-origin access to try again."
                    description="Explanation that CORS is one possible cause of the failed API request"
                  />
                </p>
                <div className="cors-permission__actions">
                  <button
                    type="button"
                    className="button button--primary"
                    disabled={requestingPermission}
                    onClick={requestApiAccess}
                  >
                    <FormattedMessage
                      id="backgrounds.online.allowCorsAccess"
                      defaultMessage="Allow cross-origin access"
                      description="Button to request cross-origin access to a background API"
                    />
                  </button>
                  <a
                    href="https://tablissng.smrff.dev/guides/json-api-backgrounds"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FormattedMessage
                      id="backgrounds.online.corsHelp"
                      defaultMessage="Learn more"
                      description="Link to help about CORS permissions for JSON background APIs"
                    />
                  </a>
                </div>
              </div>
            )}

          {BUILD_TARGET === "web" && (
            <p className="info">
              <FormattedMessage
                id="backgrounds.online.corsWarning"
                defaultMessage="The API must allow cross-origin requests in the web version."
                description="CORS requirement for JSON background APIs in the web build"
              />
            </p>
          )}

          <label>
            <input
              type="checkbox"
              checked={settings.showControls}
              onChange={(event) =>
                setData({ ...settings, showControls: event.target.checked })
              }
            />{" "}
            <FormattedMessage {...backgroundMessages.showControls} />
          </label>
        </>
      )}
    </div>
  );
};

export default OnlineSettings;
