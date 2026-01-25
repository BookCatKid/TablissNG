import React, { FC } from "react";
import { FormattedMessage } from "react-intl";

const Unknown: FC = () => (
  <p>
    <FormattedMessage
      id="plugins.unknown.name"
      defaultMessage="Unknown Widget"
      description="Name of the Unknown Widget"
    />
  </p>
);

export default Unknown;
