import type { FC } from "react";
import { FormattedMessage } from "react-intl";

import Modal from "./modal/Modal";

type Props = {
  error: Error;
  operation: "load" | "save";
  onClose: () => void;
};

const getRootCause = (error: Error): Error => {
  const seen = new Set<Error>();
  let current = error;

  while (current.cause instanceof Error && !seen.has(current.cause)) {
    seen.add(current);
    current = current.cause;
  }

  return current;
};

const StoreError: FC<Props> = ({ error, operation, onClose }) => {
  const rootCause = getRootCause(error);
  const errorText = `${error.message} ${rootCause.name} ${rootCause.message}`;
  const rateLimited =
    operation === "save" &&
    /max_write_operations|write operations|rate.?limit/i.test(errorText);
  const quotaExceeded =
    operation === "save" &&
    !rateLimited &&
    /quota|quota_bytes|storage (?:limit|capacity)|exceed(?:ed|s)/i.test(
      errorText,
    );
  const detail =
    rootCause === error
      ? `${error.name}: ${error.message}`
      : `${rootCause.name}: ${rootCause.message}`;

  return (
    <Modal onClose={onClose}>
      <div className="Settings">
        <h2 className="no-margin">
          {quotaExceeded ? (
            <FormattedMessage
              id="plugins.storageError.quotaTitle"
              defaultMessage="Storage limit reached"
              description="Title shown when saving settings would exceed the storage quota"
            />
          ) : rateLimited ? (
            <FormattedMessage
              id="plugins.storageError.rateLimitTitle"
              defaultMessage="Sync saves are temporarily limited"
              description="Title shown when browser sync storage rate-limits writes"
            />
          ) : operation === "save" ? (
            <FormattedMessage
              id="plugins.storageError.saveTitle"
              defaultMessage="Couldn't save settings"
              description="Title shown when settings storage cannot be written"
            />
          ) : (
            <FormattedMessage
              id="plugins.storageError.loadTitle"
              defaultMessage="Couldn't load settings"
              description="Title shown when settings storage cannot be opened or read"
            />
          )}
        </h2>
        <p className="large">
          {quotaExceeded ? (
            <FormattedMessage
              id="plugins.storageError.quota"
              defaultMessage="TablissNG couldn't save this change because it would exceed the browser's storage quota. Reduce the amount of synced data and try again."
              description="Explanation shown when settings exceed the browser storage quota"
            />
          ) : rateLimited ? (
            <FormattedMessage
              id="plugins.storageError.rateLimit"
              defaultMessage="The browser temporarily refused this sync write because too many changes were saved in a short period. Your settings can be saved again once the browser allows more sync writes."
              description="Explanation shown when browser sync storage rate-limits writes"
            />
          ) : operation === "save" ? (
            <FormattedMessage
              id="plugins.storageError.save"
              defaultMessage="TablissNG couldn't write this change to settings storage. The change that triggered this error may not have been saved."
              description="Explanation shown when settings storage cannot be written"
            />
          ) : (
            <FormattedMessage
              id="plugins.storageError.load"
              defaultMessage="TablissNG couldn't open or read your settings storage, so your saved settings could not be loaded."
              description="Explanation shown when settings storage cannot be opened or read"
            />
          )}
        </p>
        <p>
          <FormattedMessage
            id="plugins.storageError.reportedError"
            defaultMessage="Error: <error>{details}</error>"
            description="Shows the underlying error that caused the storage error modal to appear"
            values={{
              error: (chunks) => <code>{chunks}</code>,
              details: detail,
            }}
          />
        </p>
        <p>
          <FormattedMessage
            id="plugins.storageError3"
            defaultMessage="The <guide>support guide</guide> covers common storage problems and fixes. If this error keeps happening, <github>open an issue</github> and include the reported error above."
            description="Links to storage support and GitHub after showing the specific storage error"
            values={{
              guide: (chunks) => (
                <a href="https://tablissng.smrff.dev/support/storage-errors">
                  {chunks}
                </a>
              ),
              github: (chunks) => (
                <a href="https://github.com/BookCatKid/tablissNG/issues/new">
                  {chunks}
                </a>
              ),
            }}
          />
        </p>
      </div>
    </Modal>
  );
};

export default StoreError;
