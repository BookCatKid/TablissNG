import React from "react";
import Modal from "./modal/Modal";
import { FormattedMessage } from "react-intl";

type Props = {
  onClose: () => void;
};

const StoreError: React.FC<Props> = ({ onClose }) => {
  return (
    <Modal onClose={onClose}>
      <div className="Settings">
        <h2 className="no-margin">Storage Error</h2>
        <p className="large">
          <FormattedMessage
            id="plugins.storageError"
            defaultMessage="TablissNG is unable to load or save settings. This is most commonly caused by running in private browsing mode; but low disk space or a corrupt browser profile can also be the problem."
            description="Storage error message"
          />
        </p>
        <p>
          <FormattedMessage
            id="plugins.storageError2"
            defaultMessage="If you have settings saved with TablissNG, it might be a temporary issue. Try restarting your browser and checking if your settings return."
            description="Storage error message"
          />
        </p>
        <p>
          <FormattedMessage
            id="plugins.storageError3"
            defaultMessage="If they do not return, the {supportGuideLink} covers the common causes and how to resolve them. Otherwise, create an issue at {githubLink} if you are still unable to solve the issue."
            values={{
              supportGuideLink: (
                <a href="https://bookcatkid.github.io/TablissNG/docs/support/storage-errors">
                  <FormattedMessage
                    id="plugins.storageError.guide"
                    defaultMessage="support guide"
                  />
                </a>
              ),
              githubLink: (
                <a href="https://github.com/BookCatKid/tablissNG/issues/new">
                  <FormattedMessage
                    id="plugins.storageError.github"
                    defaultMessage="GitHub"
                  />
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
