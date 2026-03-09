import React from "react";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";
import { ErrorContext } from "../../contexts/error";
import { formatErrorLog } from "../../errorHandler";
import Modal from "./modal/Modal";
import { Icon } from "@iconify/react";

const messages = defineMessages({
  copyErrorLog: {
    id: "errors.copyErrorLog",
    defaultMessage: "Copy Error Log",
    description: "Button to copy error log to clipboard",
  },
  copied: {
    id: "errors.copied",
    defaultMessage: "Copied!",
    description: "Feedback after successfully copying error log",
  },
  copyFailed: {
    id: "errors.copyFailed",
    defaultMessage: "Failed to copy",
    description: "Feedback when copying error log fails",
  },
});

type Props = {
  onClose: () => void;
};

const Errors: React.FC<Props> = ({ onClose }) => {
  const { errors } = React.useContext(ErrorContext);
  const intl = useIntl();
  const [copied, setCopied] = React.useState(false);
  const [copyFailed, setCopyFailed] = React.useState(false);

  const handleCopy = () => {
    if (!navigator.clipboard?.writeText) {
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 3000);
      return;
    }
    const text = formatErrorLog();
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        setCopyFailed(true);
        setTimeout(() => setCopyFailed(false), 3000);
      },
    );
  };

  return (
    <Modal onClose={onClose}>
      <div className="Settings">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ margin: 0, marginRight: "auto" }}>
            <FormattedMessage
              id="errors.title"
              defaultMessage="Errors"
              description="Title of the error log panel"
            />
          </h2>
          <button className="button button--primary" onClick={handleCopy}>
            <Icon
              icon={
                copyFailed
                  ? "feather:x"
                  : copied
                    ? "feather:check"
                    : "feather:clipboard"
              }
              style={{ marginRight: "0.3rem", verticalAlign: "middle" }}
            />
            {copyFailed
              ? intl.formatMessage(messages.copyFailed)
              : copied
                ? intl.formatMessage(messages.copied)
                : intl.formatMessage(messages.copyErrorLog)}
          </button>
          <a
            className="button button--primary"
            href="https://github.com/bookcatkid/TablissNG"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FormattedMessage
              id="errors.visitGithub"
              defaultMessage="Visit Github Page"
              description="Link to the GitHub repository"
            />
          </a>
        </div>
        {errors.length === 0 ? (
          <p>
            <FormattedMessage
              id="errors.noErrors"
              defaultMessage="No errors recorded."
              description="Message when there are no errors"
            />
          </p>
        ) : (
          errors.map((error, index) => (
            <div
              key={index}
              className="Widget"
              style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
            >
              <small style={{ opacity: 0.6 }}>
                {new Date(error.timestamp).toLocaleString()}
              </small>
              <div>{error.message}</div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default Errors;
