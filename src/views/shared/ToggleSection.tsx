import type { FC, ReactNode } from "react";
import { useIntl } from "react-intl";

import { useToggle } from "../../hooks";
import { sectionMessages } from "../../locales/messages";

type Props = {
  children: ReactNode;
  name: string;
};

const ToggleSection: FC<Props> = ({ name, children }) => {
  const [isOpen, toggleOpen] = useToggle();
  const intl = useIntl();

  return (
    <>
      <p>
        <a onClick={toggleOpen}>
          {isOpen
            ? intl.formatMessage(sectionMessages.close)
            : intl.formatMessage(sectionMessages.open)}{" "}
          {name}
        </a>
      </p>

      {isOpen && children}
    </>
  );
};

export default ToggleSection;
