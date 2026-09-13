import "./StorageWarningModal.sass";

import type { FC } from "react";
import { FormattedMessage, FormattedNumber } from "react-intl";

import type {
  SyncChunkUsage,
  SyncStorageUsage,
} from "../../lib/db/storageChunks";
import Modal from "../shared/modal/Modal";

type Props = {
  usage: SyncStorageUsage;
  widgetUsage: SyncChunkUsage;
  onClose: () => void;
};

const formatBytes = (bytes: number): string => {
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
};

const StorageWarningModal: FC<Props> = ({ usage, widgetUsage, onClose }) => {
  const quotaPercent = Math.min(
    100,
    Math.round((usage.usedBytes / usage.quotaBytes) * 100),
  );
  const remainingBytes = Math.max(0, usage.quotaBytes - usage.usedBytes);
  const otherBytes = Math.max(0, usage.usedBytes - widgetUsage.bytes);

  return (
    <Modal onClose={onClose} className="StorageWarningModal">
      <div className="Settings" data-storage-warning-modal>
        <h2 className="no-margin">
          <FormattedMessage
            id="storageWarning.title"
            defaultMessage="Sync storage warning"
            description="Title for the widget sync storage warning dialog"
          />
        </h2>

        <p>
          <FormattedMessage
            id="storageWarning.intro"
            defaultMessage="This widget is using an unusually large amount of sync storage, so TablissNG splits its settings into {chunks} pieces before syncing them. Everything can still sync normally, but this leaves less room for your other synced settings."
            description="Explanation of why a widget is using chunked sync storage"
            values={{ chunks: widgetUsage.chunkCount }}
          />
        </p>

        <hr />

        <h3>
          <FormattedMessage
            id="storageWarning.totalUsage"
            defaultMessage="Sync storage"
            description="Label for total browser sync storage usage"
          />
        </h3>
        <div className="StorageWarningModal__usage-labels">
          <span>
            <FormattedMessage
              id="storageWarning.usageSummary"
              defaultMessage="{used} of {quota} used"
              description="Compact summary of used sync storage and total quota"
              values={{
                used: formatBytes(usage.usedBytes),
                quota: formatBytes(usage.quotaBytes),
              }}
            />
          </span>
          <strong>
            <FormattedNumber
              value={quotaPercent / 100}
              style="percent"
              maximumFractionDigits={0}
            />
          </strong>
        </div>
        <div
          className="StorageWarningModal__meter"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={quotaPercent}
          data-sync-usage-meter
        >
          <span
            className="StorageWarningModal__meter-fill"
            style={{ width: `${quotaPercent}%` }}
          />
        </div>

        <dl className="StorageWarningModal__details">
          <div>
            <dt>
              <FormattedMessage
                id="storageWarning.widgetData"
                defaultMessage="This widget"
                description="Label for widget sync storage size"
              />
            </dt>
            <dd>{formatBytes(widgetUsage.bytes)}</dd>
          </div>
          <div>
            <dt>
              <FormattedMessage
                id="storageWarning.chunks"
                defaultMessage="Sync chunks"
                description="Label for number of chunks used by widget data"
              />
            </dt>
            <dd>{widgetUsage.chunkCount}</dd>
          </div>
          <div>
            <dt>
              <FormattedMessage
                id="storageWarning.otherData"
                defaultMessage="Other synced data"
                description="Label for other sync storage"
              />
            </dt>
            <dd>{formatBytes(otherBytes)}</dd>
          </div>
          <div>
            <dt>
              <FormattedMessage
                id="storageWarning.remaining"
                defaultMessage="Remaining"
                description="Label for remaining browser sync storage"
              />
            </dt>
            <dd>{formatBytes(remainingBytes)}</dd>
          </div>
        </dl>

        <p>
          <FormattedMessage
            id="storageWarning.needHelp"
            defaultMessage="Need help? <issue>Open an issue</issue>."
            description="Prompt with a link to open a GitHub issue for help with sync storage"
            values={{
              issue: (chunks) => (
                <a
                  href="https://github.com/BookCatKid/TablissNG/issues/new"
                  target="_blank"
                  rel="noreferrer"
                >
                  {chunks}
                </a>
              ),
            }}
          />
        </p>
      </div>
    </Modal>
  );
};

export default StorageWarningModal;
