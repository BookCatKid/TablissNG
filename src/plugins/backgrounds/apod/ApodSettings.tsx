import "./ApodSettings.sass";

import { format } from "date-fns";
import { type FC } from "react";
import { FormattedMessage } from "react-intl";

import { backgroundMessages } from "../../../locales/messages";
import { DebounceInput } from "../../shared";
import { ApodDate, defaultData, Props } from "./types";
import { useApodAccess } from "./useApodAccess";

const maxDate = format(new Date(), "yyyy-MM-dd");

const ApodSettings: FC<Props> = ({ data = defaultData, setData }) => {
  const { hasAccess, requestAccess } = useApodAccess();
  return (
    <div className="ApodSettings">
      {!hasAccess && (
        <div>
          <p>
            <FormattedMessage
              id="backgrounds.apod.accessDescription"
              defaultMessage="Allow access to NASA to load the Astronomy Picture of the Day."
              description="Explanation of the optional NASA host permission required by the APOD API"
            />
          </p>
          <button
            type="button"
            className="button button--primary"
            onClick={requestAccess}
          >
            <FormattedMessage
              id="backgrounds.apod.allowAccess"
              defaultMessage="Allow NASA access"
              description="Button to request access to the NASA APOD API"
            />
          </button>
        </div>
      )}
      <label>
        <FormattedMessage {...backgroundMessages.dateOfPicture} />
        <select
          value={data.date}
          onChange={(event) =>
            setData({ ...data, date: event.target.value as ApodDate })
          }
        >
          <option value="today">
            <FormattedMessage {...backgroundMessages.today} />
          </option>
          <option value="custom">
            <FormattedMessage {...backgroundMessages.customDate} />
          </option>
        </select>
      </label>

      {data.date === "custom" && (
        <label>
          <FormattedMessage {...backgroundMessages.date} />
          <DebounceInput
            type="date"
            value={data.customDate}
            min="1995-06-16"
            max={maxDate}
            className="date"
            onChange={(value) => setData({ ...data, customDate: value })}
            wait={500}
          />
        </label>
      )}

      <label>
        <input
          type="checkbox"
          checked={data.showTitle}
          onChange={(event) =>
            setData({ ...data, showTitle: event.target.checked })
          }
        />{" "}
        <FormattedMessage {...backgroundMessages.showTitle} />
      </label>
    </div>
  );
};

export default ApodSettings;
