import { FC } from "react";
import { FallbackProps } from "react-error-boundary";
import { FormattedMessage } from "react-intl";

import { Icon } from "../../icons";

const Crashed: FC<FallbackProps> = () => (
  <div className="Crashed">
    <Icon name="feather:alert-triangle" />
    <FormattedMessage
      id="plugins.crashed"
      defaultMessage="Sorry this plugin has crashed!"
      description="Message that displays when a plugin crashes"
    />
  </div>
);

export default Crashed;
