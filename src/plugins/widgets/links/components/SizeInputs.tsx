import type { FC } from "react";
import { FormattedMessage } from "react-intl";

import { Link } from "../types";

interface SizeInputsProps {
  customWidth?: number;
  customHeight?: number;
  conserveAspectRatio?: boolean;
  resolution?: number;
  showResolutionInput: boolean;
  onChange: (values: Partial<Link>) => void;
  onResolutionChange: (resolution: number) => void;
}

export const SizeInputs: FC<SizeInputsProps> = ({
  customWidth,
  customHeight,
  conserveAspectRatio,
  resolution,
  showResolutionInput,
  onChange,
  onResolutionChange,
}) => {
  return (
    <>
      {showResolutionInput && (
        <label>
          <FormattedMessage
            id="plugins.links.input.resolution"
            defaultMessage="Resolution"
            description="Label for icon resolution selector"
          />
          <select
            value={resolution ?? 256}
            onChange={(event) => onResolutionChange(Number(event.target.value))}
          >
            <option value="16">16x16</option>
            <option value="32">32x32</option>
            <option value="64">64x64</option>
            <option value="128">128x128</option>
            <option value="256">256x256</option>
          </select>
        </label>
      )}

      <label>
        <input
          type="checkbox"
          checked={!!conserveAspectRatio}
          onChange={(event) =>
            onChange({ conserveAspectRatio: event.target.checked })
          }
        />
        <FormattedMessage
          id="plugins.links.input.conserveAspectRatio"
          defaultMessage="Conserve Aspect Ratio"
          description="Checkbox label to maintain icon aspect ratio"
        />
      </label>

      {conserveAspectRatio ? (
        <label>
          <FormattedMessage
            id="plugins.links.input.scale"
            defaultMessage="Scale"
            description="Input label for scaling the icon size proportionately"
          />
          <input
            type="number"
            value={customWidth ?? 24}
            onChange={(event) => {
              const val = Number(event.target.value);
              onChange({
                customWidth: val,
                customHeight: val,
              });
            }}
          />
        </label>
      ) : (
        <>
          <label>
            <FormattedMessage
              id="plugins.links.input.iconWidth"
              defaultMessage="Icon Width"
              description="Input label for icon width"
            />
            <input
              type="number"
              value={customWidth ?? 24}
              onChange={(event) =>
                onChange({ customWidth: Number(event.target.value) })
              }
            />
          </label>
          <label>
            <FormattedMessage
              id="plugins.links.input.iconHeight"
              defaultMessage="Icon Height"
              description="Input label for icon height"
            />
            <input
              type="number"
              value={customHeight ?? 24}
              onChange={(event) =>
                onChange({ customHeight: Number(event.target.value) })
              }
            />
          </label>
        </>
      )}
    </>
  );
};
