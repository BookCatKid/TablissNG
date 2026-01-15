import React, { FC } from "react";
import { FallbackProps } from "react-error-boundary";
import { FormattedMessage } from "react-intl";

import { Icon } from "@iconify/react";

const Crashed: FC<FallbackProps> = () => (
  <div className="Crashed">
    <Icon icon="feather:alert-triangle" />
    <FormattedMessage
      id="plugins.crashed"
      defaultMessage="Sorry this plugin has crashed!"
      description="Message that displays when a plugin crashes"
    />
  </div>
);

export default Crashed;
