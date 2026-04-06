import "./Modal.sass";

import type { FC, ReactNode } from "react";

type Props = {
  children: ReactNode;
  onClose: () => void;
};

const Modal: FC<Props> = ({ children, onClose }) => {
  return (
    <div className="Modal-container" onClick={onClose}>
      <div className="Modal" onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
