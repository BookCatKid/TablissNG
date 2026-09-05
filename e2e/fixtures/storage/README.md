# Storage integrity stress tests

Run the adapter suite with `pnpm test:e2e:storage`. For repeated runs, use
`pnpm test:e2e:storage --repeat-each=5`. Run `pnpm test:e2e:extension` to also
build the production Chromium extension and exercise its dashboard, including
oversized Notes edits and a full browser restart. Headed Chromium is required;
on Linux CI use `xvfb-run -a pnpm test:e2e:extension`. The reusable test
workflow runs this in a separate extension E2E job on pull requests and pushes.

The adapter suite builds a temporary, minimal extension that imports the actual
`src/lib/db/storage.ts`, DB and Stream modules. Each test uses a fresh disposable
Chromium profile and the real `chrome.storage.sync` backend. The wrapper can
pause or reject selected calls, but successful operations always reach Chrome.
No test touches the user's installed extension or browser profile. The UI test
uses the production build, without a storage wrapper.

Coverage includes:

- Exact byte boundaries, UTF-8, escapes, combining characters, lone surrogates,
  nested JSON, and user keys resembling internal chunk names.
- Growth, shrinkage, deletion, recreation, reloads, and concurrent tabs.
- 5,000 rapidly coalesced edits and five reproducible seeds with 5,000 mixed
  edits each. An independent Map supplies the expected values after every
  restart; physical chunks are also checked for quota compliance and leaks.
- Hundreds of distinct keys in one batch, delayed overlapping batches, and
  real Chrome total-byte, item-count and write-rate quota rejections.
- Failures before chunk staging, before pointer publication, during deletion,
  and during obsolete-chunk cleanup; lost acknowledgements after successful
  writes; recovery on subsequent saves.
- Closing a writer between persistence phases, plus a full browser restart
  after a successful UI save.
- Missing, malformed, reordered, duplicated, foreign, non-string and modified
  chunks; checksum failures even when modified content is still valid JSON.
- Remote manifest-before-chunks delivery, legacy-format migration, and local
  storage values that happen to resemble chunk manifests.

## Persistence contract and limits

New sync values use unique immutable chunk generations outside the logical
DB namespace. SHA-256 covers the serialized payload. Chunks are written before
publishing their manifest; old chunks are removed only after the pointer is
successfully updated/deleted. Related writes remain batched. Web Locks serialize
loads and saves across cooperating tabs on one device. Failed cleanup is retained
for the next save in that adapter instance.

Safe replacement temporarily needs space for **both generations**. When Chrome
rejects a write, the previous committed value remains readable and a storage
error is reported; the rejected edit is not claimed to be durable. A single
serialized value larger than the total sync quota is rejected before chunking.

When a manifest cannot be reconstructed and validated, healthy keys are loaded
but storage initialization rejects and installs no save listener. The existing
error UI reports the failure. This intentionally prevents defaults or migrations
from overwriting recovery data. After missing remote chunks arrive, reloading can
succeed. There is no automatic repair that silently discards a damaged record.

These tests do **not** prove universal absence of data loss. Browser termination
can discard edits still in the one-second debounce or before publication. Killing
a writer after staging can leave unreachable chunks; they are not blindly swept,
because remote sync can deliver chunks before their manifest. Such abandoned
chunks can consume quota. Cross-device cloud synchronization and conflict
resolution are not exercised by local Chromium profiles; Web Locks do not span
devices. This remains last-writer-wins storage, not a merge of concurrent edits.
Legacy manifests have no checksum and their original user/chunk key ambiguity
cannot be retroactively resolved. Older extension versions cannot read the new
format, so reverting code alone is not a storage downgrade strategy.
