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
  onSelectedChange: (label: Label, operation: "ADD" | "REMOVE") => void;
  boardId: string;
}

export function LabelsForm({
  labelsOnCard,
  onSelectedChange,
  boardId,
}: LabelsFormProps) {
  const { labels: availableLabels, isLoading } = useLabelsOnBoard(boardId);
  const [labelsSelected, setLabelsSelected] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    const selected: Record<string, boolean> = {};
    for (const label of availableLabels) {
      selected[label.id] = false;
    }

    for (const label of labelsOnCard) {
      selected[label.id] = true;
    }
    setLabelsSelected(selected);
  }, [labelsOnCard, availableLabels]);

  const handleLabelToggled = (labelId: string) => {
    const updated: Record<string, boolean> = { ...labelsSelected };
    const operation = !labelsSelected[labelId] ? "ADD" : "REMOVE";
    updated[labelId] = !labelsSelected[labelId];
    setLabelsSelected(updated);
    const label = availableLabels.find((l) => l.id === labelId);
    if (label) {
      onSelectedChange(label, operation);
    }
  };

  return (
    <div className="select-labels-form-container">
      <p className="select-labels-header">Labels</p>
      {isLoading ? (
        <div className="select-labels-container-loader">
          <FormattedMessage {...commonMessages.loading} /> <Spinner size={16} />
        </div>
      ) : (
        <div className="select-labels-label-container">
          {availableLabels.map((l) => {
            const isDark = (c: TrelloColour) => c.endsWith("_dark");

            const textColour = isDark(l.colour)
              ? "rgba(255,255,255, 0.8)"
              : "rgba(0, 0, 0, 0.8)";
            return (
              <div key={l.id} className="checkable-label">
                <Checkbox
                  value={l.id}
                  label={""}
                  checked={labelsSelected[l.id] ?? false}
                  onChange={handleLabelToggled}
                />
                <p
                  style={{
                    width: "100%",
                    borderRadius: "2px",
                    fontWeight: 400,
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
      )}
    </div>
  );
}
