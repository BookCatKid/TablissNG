import React, { FC } from "react";
import { FormattedMessage } from "react-intl";
import { API } from "../../types";

const UnknownSettings: FC<API> = ({ data }) => {
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

      {data !== undefined && data !== null && (
        <>
          <h4 style={{ marginTop: "1.5em", fontSize: "0.9em" }}>
            Configuration
          </h4>
          <pre
            style={{
              padding: "1em",
              background: "rgba(0,0,0,0.05)",
              borderRadius: "4px",
              fontSize: "0.8em",
              overflowX: "auto",
            }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
};

export default UnknownSettings;
