import React, { FC, useEffect, useState } from "react";
import { useTime } from "../../../hooks";
import { Props, defaultData } from "./types";
import "./BinaryTime.sass";
import { toZonedTime } from "date-fns-tz";

interface PipProps {
  isOn: boolean;
  onColor: string;
  offColor: string;
}

interface BinaryDigitProps {
  base2NumberAsArray: number[];
  onColor: string;
  offColor: string;
}

interface BinaryDigitGroupProps {
  group: number[][];
  onColor: string;
  offColor: string;
}

const Pip: FC<PipProps> = ({ isOn, onColor, offColor }) => (
  <div
    className={`pip ${isOn ? "pip--on" : ""}`}
    style={{
      backgroundColor: isOn ? onColor : offColor,
    }}
  ></div>
);

const BinaryDigit: FC<BinaryDigitProps> = ({
  base2NumberAsArray,
  onColor,
  offColor,
}) => (
  <div className="binary-digit">
    {base2NumberAsArray.map((pip, idx) => (
      <Pip key={idx} isOn={pip === 1} onColor={onColor} offColor={offColor} />
    ))}
  </div>
);

const BinaryDigitGroup: FC<BinaryDigitGroupProps> = ({
  group,
  onColor,
  offColor,
}) => (
  <div className="binary-digit-group">
    {group.map((binaryDigit, idx) => (
      <BinaryDigit
        key={idx}
        base2NumberAsArray={binaryDigit}
        onColor={onColor}
        offColor={offColor}
      />
    ))}
  </div>
);

function numberToBinary(base10Number: number): number[] {
  const base2Values = [8, 4, 2, 1];
  const output = [0, 0, 0, 0];
  let remainder = base10Number;

  base2Values.forEach((val, idx) => {
    const left = remainder - val;
    if (left >= 0) {
      output[idx] = 1;
      remainder = left;
    }
  });

  return output;
}

function numberAsBinaryArrayPair(number: number): number[][] {
  const pair: number[][] = [];
  if (number < 10) {
    pair[0] = numberToBinary(0);
    pair[1] = numberToBinary(number);
  } else {
    const numberAsArray = String(number).split("");
    pair[0] = numberToBinary(parseInt(numberAsArray[0], 10));
    pair[1] = numberToBinary(parseInt(numberAsArray[1], 10));
  }

  return pair;
}

const BinaryTime: FC<Props> = ({ data = defaultData }) => {
  const {
    name,
    showHours,
    showMinutes,
    showSeconds,
    onColor,
    offColor,
    timeZone,
  } = data;
  const [digits, setDigits] = useState<number[][][]>([[], [], []]);

  let time = useTime(timeZone ? "absolute" : "zoned");

  if (timeZone) {
    time = toZonedTime(time, timeZone);
  }

  useEffect(() => {
    const updateTime = () => {
      const hours = time.getHours();
      const minutes = time.getMinutes();
      const seconds = time.getSeconds();

      const newDigits = [
        ...(showHours ? [numberAsBinaryArrayPair(hours)] : []),
        ...(showMinutes ? [numberAsBinaryArrayPair(minutes)] : []),
        ...(showSeconds ? [numberAsBinaryArrayPair(seconds)] : []),
      ];

      setDigits(newDigits);
    };

    updateTime();
  }, [time, showHours, showMinutes, showSeconds]);

  return (
    <div className="BinaryTime">
      <div className="binary-clock">
        {digits.map((digit, idx) => (
          <BinaryDigitGroup
            key={idx}
            group={digit}
            onColor={onColor}
            offColor={offColor}
          />
        ))}
      </div>
      {name && <h2>{name}</h2>}
    </div>
  );
};

export default BinaryTime;
