import "./style.sass";

import { useEffect, useState } from "react";

import { Spinner } from "../../../../../../shared";
import { Checkbox } from "../../../../../../shared/Checkbox";
import { useLabelsOnBoard } from "../../../../hooks/useLabelsOnBoard";
import { colourPalette, Label } from "../../../../types";

interface LabelsFormProps {
  labelsOnCard: Label[];
  boardId: string;
}

export function LabelsForm({ labelsOnCard, boardId }: LabelsFormProps) {
  const { labels, isLoading } = useLabelsOnBoard(boardId);
  const [labelsSelected, setLabelsSelected] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    const selected: Record<string, boolean> = {};
    for (const label of labelsOnCard) {
      selected[label.id] = true;
    }
    setLabelsSelected(selected);
  }, [labelsOnCard]);

  let view = (
    <div className="select-labels-container-loader">
      <p>Loading...</p>
      <Spinner size={16} />
    </div>
  );

  if (!isLoading) {
    view = (
      <div className="select-labels-label-container">
        {labels.map((l, i) => (
          <div key={i} className="checkable-label">
            <Checkbox
              value={l.id}
              label={""}
              checked={labelsSelected[l.id] ?? false}
              onChange={() => {}}
            />
            <p
              style={{
                borderRadius: "2px",
                margin: "0",
                color: "rgba(0, 0, 0, 0.86)",
                background: colourPalette[l.colour],
                padding: "2px 8px",
              }}
            >
              {l.name}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="select-labels-form-container">
      <p className="select-labels-header">Labels</p>
      {view}
    </div>
  );
}
