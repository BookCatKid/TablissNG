import "./Modal.sass";

import type { FC, ReactNode } from "react";

type Props = {
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  className?: string;
  center?: boolean;
};

const Modal: FC<Props> = ({ children, footer, onClose, className, center }) => {
  return (
    <div
      className={`Modal-container ${center ? "Modal-container--center" : ""}`}
      onClick={onClose}
    >
      <div
        className={`Modal ${className || ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="Modal-content">{children}</div>
        {footer && <div className="Modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
