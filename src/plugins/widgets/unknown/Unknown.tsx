import React, { FC } from "react";
import { FormattedMessage } from "react-intl";

const Unknown: FC = () => (
  <p>
    <FormattedMessage
      id="plugins.unknown.widgetText"
      defaultMessage="Something has gone wrong"
      description="The text to display on the dashboard when an unknown widget is encountered"
    />
  </p>
);

export default Unknown;
