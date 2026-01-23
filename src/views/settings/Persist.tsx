import React from "react";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";

const messages = defineMessages({
  storageUnavailable: {
    id: "settings.persist.error.storageUnavailable",
    defaultMessage: "Storage persistence API not available in this browser.",
    description: "Shown when the Storage Persistence API isn't present",
  },
  denied: {
    id: "settings.persist.error.denied",
    defaultMessage: "Browser denied persistent storage.",
    description: "Shown when the browser refuses persistent storage",
  },
  unknownError: {
    id: "settings.persist.error.unknown",
    defaultMessage: "An error occurred: {details}",
    description: "Generic error wrapper for unexpected exceptions",
  },
});

const Persist: React.FC = () => {
  const intl = useIntl();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [persisted, setPersisted] = React.useState<boolean | null>(true);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const check = async () => {
      try {
        if (!navigator.storage || !navigator.storage.persisted) {
          setErrorMessage(intl.formatMessage(messages.storageUnavailable));
          setPersisted(false);
          return;
        }
        setPersisted(await navigator.storage.persisted());
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : String(e));
        setPersisted(false);
      }
    };
    check();
  }, []);

  const handleClick = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (!navigator.storage || !navigator.storage.persist) {
        setErrorMessage(intl.formatMessage(messages.storageUnavailable));
        return;
      }
      const granted = await navigator.storage.persist();
      if (granted) {
        // Immediately mark persisted
        setPersisted(true);
      } else {
        setErrorMessage(intl.formatMessage(messages.denied));
      }
    } catch (e: unknown) {
      setErrorMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Widget" style={{ textAlign: "center" }}>
      <h4>
        <FormattedMessage
          id="settings.persist.title"
          defaultMessage="Persist Settings"
          description="Persist Settings title"
        />
      </h4>
      <p>
        <FormattedMessage
          id="settings.persist.description"
          defaultMessage="Would you like Tabliss to ask your browser to save your settings permanently?"
          description="Persist Settings description"
        />
      </p>

      {persisted === true ? (
        <p className="info">
          <FormattedMessage
            id="settings.persist.persisted"
            defaultMessage="Settings are persisted"
            description="Message shown when settings are persisted"
          />
        </p>
      ) : (
        <>
          <button
            className="button button--primary"
            onClick={handleClick}
            disabled={loading}
          >
            {loading ? (
              <FormattedMessage
                id="settings.persist.persisting"
                defaultMessage="Persisting…"
                description="Button text shown while requesting persistent storage"
              />
            ) : (
              <FormattedMessage
                id="settings.persist.button"
                defaultMessage="Persist Settings"
                description="Persist Settings button"
              />
            )}
          </button>

          {errorMessage ? (
            <div>
              <p>
                <FormattedMessage
                  id="settings.persist.error"
                  defaultMessage="Could not persist settings at this time."
                  description="Persist Settings error"
                />
              </p>
              <p className="info">{errorMessage}</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default Persist;
