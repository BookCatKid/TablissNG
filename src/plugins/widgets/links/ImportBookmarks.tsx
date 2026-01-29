import React, { FC, useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { BookmarkTreeNode } from "../bookmarks/types";
import { Link } from "./types";

interface Props {
  onImport: (links: Link[]) => void;
}

const ImportBookmarks: FC<Props> = ({ onImport }) => {
  const [bookmarkTree, setBookmarkTree] = useState<BookmarkTreeNode>();
  const [hasBookmarksPermission, setHasBookmarksPermission] =
    useState<boolean>(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");

  useEffect(() => {
    const checkPermission = async () => {
      const granted = await browser.permissions.contains({
        permissions: ["bookmarks"],
      });
      setHasBookmarksPermission(granted);
      if (granted) {
        const tree = await browser.bookmarks.getTree();
        setBookmarkTree(tree[0]);
      }
    };
    checkPermission();
  }, []);

  const requestPermission = async () => {
    const granted = await browser.permissions.request({
      permissions: ["bookmarks"],
    });
    setHasBookmarksPermission(granted);
    if (granted) {
      const tree = await browser.bookmarks.getTree();
      setBookmarkTree(tree[0]);
    }
  };

  const [importCount, setImportCount] = useState<number | null>(null);

  const handleImport = async () => {
    if (!selectedFolderId) return;

    const folder = await browser.bookmarks.getSubTree(selectedFolderId);
    if (!folder || folder.length === 0) return;

    const collectedLinks: Link[] = [];

    const collectLinks = (nodes: BookmarkTreeNode[]) => {
      for (const node of nodes) {
        if (node.url) {
          collectedLinks.push({
            id:
              Date.now().toString(36) +
              Math.random().toString(36).slice(2, 7) +
              collectedLinks.length,
            name: node.title,
            url: node.url,
            icon: "_favicon_google",
          });
        }
        if (node.children) {
          collectLinks(node.children);
        }
      }
    };

    collectLinks(folder[0].children || []);

    if (collectedLinks.length > 0) {
      onImport(collectedLinks);
      setImportCount(collectedLinks.length);
      setTimeout(() => setImportCount(null), 3000);
    }
  };

  const folderOptions: React.JSX.Element[] = [];
  const descendTree = (tree: BookmarkTreeNode | undefined, pad: string) => {
    if (!tree || tree.url) return;

    folderOptions.push(
      <option key={tree.id} value={tree.id}>
        {pad + (tree.title || "Root")}
      </option>,
    );

    if (tree.children) {
      for (const item of tree.children) {
        descendTree(item, pad + "\u00A0\u00A0\u00A0");
      }
    }
  };
  descendTree(bookmarkTree, "");

  return (
    <>
      <hr />
      <h4>
        <FormattedMessage
          id="plugins.links.importFromBookmarks"
          defaultMessage="Import from bookmarks"
          description="Title for importing bookmarks section"
        />
      </h4>
      {hasBookmarksPermission ? (
        <div className="import-bookmarks">
          <label>
            <FormattedMessage
              id="plugins.links.selectFolder"
              defaultMessage="Select folder"
              description="Label for selecting a bookmark folder"
            />
            <select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
            >
              <option value="">---</option>
              {folderOptions}
            </select>
          </label>
          <button
            className="button button--primary"
            onClick={handleImport}
            disabled={!selectedFolderId}
            type="button"
          >
            <FormattedMessage
              id="plugins.links.import"
              defaultMessage="Import"
              description="Label for import button"
            />
          </button>
          {importCount !== null && (
            <p className="import-success">
              <FormattedMessage
                id="plugins.links.importedCount"
                defaultMessage="Imported {count} links"
                description="Success message after importing bookmarks"
                values={{ count: importCount }}
              />
            </p>
          )}
        </div>
      ) : (
        <p>
          <FormattedMessage
            id="plugins.links.bookmarksPermissionRequired"
            defaultMessage="Bookmarks permission is required to import."
            description="Message when bookmarks permission is missing"
          />
          <br />
          <button
            className="button button--primary"
            style={{ marginTop: "0.5rem" }}
            onClick={requestPermission}
          >
            <FormattedMessage
              id="plugins.links.requestPermission"
              defaultMessage="Request Permission"
              description="Button to request bookmarks permission"
            />
          </button>
        </p>
      )}
    </>
  );
};

export default ImportBookmarks;
