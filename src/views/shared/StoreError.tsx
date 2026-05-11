import type { FC } from "react";
import { FormattedMessage } from "react-intl";

import Modal from "./modal/Modal";

type Props = {
  onClose: () => void;
};

const StoreError: FC<Props> = ({ onClose }) => {
  return (
    <Modal onClose={onClose}>
      <div className="Settings">
        <h2 className="no-margin">
          <FormattedMessage
            id="plugins.storageError.title"
            defaultMessage="Storage Error"
            description="Title for the storage error modal"
          />
        </h2>
        <p className="large">
          <FormattedMessage
            id="plugins.storageError"
            defaultMessage="TablissNG is unable to load or save settings. This is most commonly caused by running in private browsing mode; but low disk space or a corrupt browser profile can also be the problem."
            description="First paragraph explaining the reasons for a storage error"
          />
        </p>
        <p>
          <FormattedMessage
            id="plugins.storageError2"
            defaultMessage="If you have settings saved with TablissNG, it might be a temporary issue. Try restarting your browser and checking if your settings return."
            description="Second paragraph suggesting to restart the browser to fix the storage error"
          />
        </p>
        <p>
          <FormattedMessage
            id="plugins.storageError3"
            defaultMessage="If they do not return, the <guide>support guide</guide> covers the common causes and how to resolve them. Otherwise, create an issue at <github>GitHub</github> if you are still unable to solve the issue."
            description="Third paragraph linking to the support guide and GitHub issues. Tags wrap clickable link text."
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
