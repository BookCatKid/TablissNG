import React, { FC } from "react";
import { FormattedMessage } from "react-intl";

const UnknownSettings: FC = () => {
  return (
    <div className="UnknownSettings">
      <p className="info">
        <FormattedMessage
          id="plugins.unknown.errorMessage"
          defaultMessage="Something went wrong, perhaps an outdated or incompatible config was imported? If you need any help whatsoever, please open an issue on"
          description="Error message when an unknown widget is encountered"
        />
        &nbsp;
        <a
          href="https://github.com/BookCatKid/tabliss-maintained/issues/new"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        .
      </p>
    </div>
  );
};

export default UnknownSettings;
