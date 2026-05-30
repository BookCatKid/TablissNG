import "./style.sass";

import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import { commonMessages } from "../../../../../../../locales/messages";
import { Spinner } from "../../../../../../shared";
import { Checkbox } from "../../../../../../shared/Checkbox";
import { useLabelsOnBoard } from "../../../../hooks/useLabelsOnBoard";
import { colourPalette, Label, TrelloColour } from "../../../../types";

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
    console.log(selected);
    setLabelsSelected(selected);
  }, [labelsOnCard]);

  console.log(labelsSelected);

  let view = (
    <div className="select-labels-container-loader">
      <FormattedMessage {...commonMessages.loading} /> <Spinner size={16} />
    </div>
  );

  if (!isLoading) {
    view = (
      <div className="select-labels-label-container">
        {labels.map((l, i) => {
          const isDark = (c: TrelloColour) => c.endsWith("_dark");

          const textColour = isDark(l.colour)
            ? "rgba(255,255,255, 0.8)"
            : "rgba(0, 0, 0, 0.8)";
          return (
            <div key={i} className="checkable-label">
              <Checkbox
                value={l.id}
                label={""}
                checked={labelsSelected[l.id] ?? false}
                onChange={() => {}}
              />
              <p
                style={{
                  width: "100%",
                  borderRadius: "2px",
                  fontWeight: 200,
                  margin: "0",
                  color: `${textColour}`,
                  background: colourPalette[l.colour],
                  padding: "2px 8px",
                }}
              >
                {l.name}
              </p>
            </div>
          );
        })}
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
