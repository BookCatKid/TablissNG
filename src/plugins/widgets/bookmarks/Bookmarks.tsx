import React, { FC, ReactNode, useEffect, useState } from "react";
import { defaultData, Props } from "./types";
import "./Bookmarks.sass";
import Icon from "../../../views/shared/icons/Icon";
import { BookmarkTreeNode } from "./types";
import { cleanTitle, truncateText } from "../topSites/TopSites";

type NodeProps = {
  node: BookmarkTreeNode;
  depth: number;
  wrap: boolean;
  navigationStyle: "drill-down" | "expand-collapse" | "auto-expanded";
  onFolderClick?: (folderId: string) => void;
  iconProvider: string;
  shortNames: boolean;
  maxTextLength: number;
  isRoot?: boolean;
  expandedFolders?: string[];
  setExpandedFolders?: (ids: string[]) => void;
  rememberExpanded?: boolean;
};

const Node: FC<NodeProps> = ({
  node,
  depth,
  wrap,
  navigationStyle,
  onFolderClick,
  iconProvider,
  shortNames,
  maxTextLength,
  isRoot = false,
  expandedFolders = [],
  setExpandedFolders,
  rememberExpanded = true,
}) => {
  // For auto-expanded mode, folders are expanded by default
  const isFolder = !node.url;
  // Local state for expansion if not remembering
  const [localExpanded, setLocalExpanded] = useState(false);

  let isExpanded = false;
  if (navigationStyle === "auto-expanded") {
    isExpanded = true;
  } else if (!isFolder) {
    isExpanded = false;
  } else if (navigationStyle === "expand-collapse") {
    if (rememberExpanded && setExpandedFolders) {
      isExpanded = expandedFolders.includes(node.id);
    } else {
      isExpanded = localExpanded;
    }
  } else {
    isExpanded = false;
  }
  const cls = isFolder ? "folder" : "bookmark";

  // Skip rendering if this is the root node in auto-expanded mode
  if (navigationStyle === "auto-expanded" && isRoot && isFolder) {
    return (
      <>
        {node.children?.map((child) => (
          <Node
            key={child.id}
            node={child}
            depth={0} // Start at depth 0 for children of root
            wrap={wrap}
            navigationStyle={navigationStyle}
            onFolderClick={onFolderClick}
            iconProvider={iconProvider}
            shortNames={shortNames}
            maxTextLength={maxTextLength}
            expandedFolders={expandedFolders}
            setExpandedFolders={setExpandedFolders}
            rememberExpanded={rememberExpanded}
          />
        ))}
      </>
    );
  }

  const handleClick = () => {
    if (!isFolder) return;

    if (navigationStyle === "drill-down") {
      onFolderClick?.(node.id);
    } else if (navigationStyle === "expand-collapse") {
      if (rememberExpanded && setExpandedFolders) {
        if (isExpanded) {
          setExpandedFolders(expandedFolders.filter((id) => id !== node.id));
        } else {
          setExpandedFolders([...expandedFolders, node.id]);
        }
      } else {
        setLocalExpanded((exp) => !exp);
      }
    }
    // No action for auto-expanded mode
  };

  let displayTitle: string;
  if (isFolder) {
    displayTitle = node.title?.trim() ? node.title : "(Untitled Folder)";
  } else if (shortNames && node.url) {
    displayTitle = truncateText(
      cleanTitle(node.title, node.url),
      maxTextLength,
    );
  } else {
    displayTitle = node.title;
  }

  const domain = node.url ? new URL(node.url).hostname : "";

  // Determine if we should add the 'no-rotate' class for auto-expanded mode
  const folderClass = `${cls} ${isExpanded ? "expanded" : ""} ${navigationStyle === "auto-expanded" ? "no-rotate" : ""}`;

  return (
    <>
      <div
        className={folderClass}
        style={{
          marginLeft:
            isFolder && isExpanded ? depth - 0.2 + "em" : depth + "em",
          whiteSpace: wrap ? undefined : "pre",
          cursor:
            navigationStyle === "auto-expanded" && isFolder
              ? "default"
              : "pointer",
        }}
        onClick={handleClick}
      >
        {isFolder ? (
          <Icon name={cls} />
        ) : iconProvider === "_favicon_duckduckgo" ? (
          <img alt="" src={`https://icons.duckduckgo.com/ip3/${domain}.ico`} />
        ) : iconProvider === "_favicon_google" ? (
          <img
            alt=""
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
          />
        ) : iconProvider === "_favicon_favicone" ? (
          <img alt="" src={`https://favicone.com/${domain}?s=32`} />
        ) : (
          <Icon name={cls} />
        )}
        {node.url ? <a href={node.url}>{displayTitle}</a> : displayTitle}
      </div>

      {/* Render children for both expand-collapse and auto-expanded modes */}
      {(navigationStyle === "expand-collapse" ||
        navigationStyle === "auto-expanded") &&
        isFolder &&
        isExpanded &&
        node.children?.map((child) => (
          <Node
            key={child.id}
            node={child}
            depth={depth + 1}
            wrap={wrap}
            navigationStyle={navigationStyle}
            onFolderClick={onFolderClick}
            iconProvider={iconProvider}
            shortNames={shortNames}
            maxTextLength={maxTextLength}
            expandedFolders={expandedFolders}
            setExpandedFolders={setExpandedFolders}
            rememberExpanded={rememberExpanded}
          />
        ))}
    </>
  );
};

const Bookmarks: FC<Props> = ({ data = defaultData, setData }) => {
  const [tree, setTree] = useState<BookmarkTreeNode>();
  const [hasPermission, setHasPermission] = useState<boolean>(true);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [navigationStack, setNavigationStack] = useState<BookmarkTreeNode[]>(
    [],
  );

  useEffect(() => {
    const checkPermission = async () => {
      const granted = await browser.permissions.contains({
        permissions: ["bookmarks"],
      });
      if (granted) {
        const rootId = data.rootBookmark || null;
        setCurrentFolder(rootId);
        const treePromise = rootId
          ? browser.bookmarks.getSubTree(rootId)
          : browser.bookmarks.getTree();
        treePromise.then((tree) => {
          setTree(tree[0]);
          setNavigationStack([tree[0]]);
        });
      } else {
        setHasPermission(false);
      }
    };
    checkPermission();
  }, [data.rootBookmark]);

  const requestPermission = async () => {
    const granted = await browser.permissions.request({
      permissions: ["bookmarks"],
    });
    setHasPermission(granted);
    if (granted) {
      const rootId = data.rootBookmark || null;
      setCurrentFolder(rootId);
      const treePromise = rootId
        ? browser.bookmarks.getSubTree(rootId)
        : browser.bookmarks.getTree();
      treePromise.then((tree) => {
        setTree(tree[0]);
        setNavigationStack([tree[0]]);
      });
    }
  };

  const navigateToFolder = async (folderId: string) => {
    const folderTree = await browser.bookmarks.getSubTree(folderId);
    setCurrentFolder(folderId);
    setNavigationStack((prev) => [...prev, folderTree[0]]);
  };

  const navigateBack = () => {
    if (navigationStack.length > 1) {
      const newStack = [...navigationStack];
      newStack.pop();
      setNavigationStack(newStack);
      const previousFolder = newStack[newStack.length - 1];
      setCurrentFolder(previousFolder.id);
    }
  };

  if (!hasPermission) {
    return (
      <div className="Bookmarks">
        <button
          className="request-permission"
          style={{ padding: "0.5em 1em" }}
          onClick={requestPermission}
        >
          Bookmarks permission required for this widget (click to request)
        </button>
      </div>
    );
  }

  if (!tree) return null;

  return (
    <div
      className="Bookmarks"
      style={{
        maxWidth: data.maxWidth + "em",
        maxHeight: data.maxHeight + "em",
        overflowY: "auto",
      }}
    >
      {data.navigationStyle === "drill-down" ? (
        <>
          {navigationStack.length > 1 && (
            <div
              className="folder"
              style={{ marginLeft: "0em", cursor: "pointer" }}
              onClick={navigateBack}
            >
              <Icon name="folder" />
              ..
            </div>
          )}
          {navigationStack[navigationStack.length - 1]?.children?.map(
            (item) => (
              <Node
                key={item.id}
                node={item}
                depth={0}
                wrap={data.wrap}
                navigationStyle={data.navigationStyle}
                onFolderClick={navigateToFolder}
                iconProvider={data.iconProvider}
                shortNames={data.shortNames}
                maxTextLength={data.maxTextLength}
              />
            ),
          )}
        </>
      ) : data.navigationStyle === "auto-expanded" ? (
        <Node
          node={tree}
          depth={0}
          wrap={data.wrap}
          navigationStyle={data.navigationStyle}
          onFolderClick={navigateToFolder}
          iconProvider={data.iconProvider}
          shortNames={data.shortNames}
          maxTextLength={data.maxTextLength}
          isRoot={true} // Mark as root node for auto-expanded mode
        />
      ) : (
        <Node
          node={tree}
          depth={0}
          wrap={data.wrap}
          navigationStyle={data.navigationStyle}
          onFolderClick={navigateToFolder}
          iconProvider={data.iconProvider}
          shortNames={data.shortNames}
          maxTextLength={data.maxTextLength}
          expandedFolders={data.expandedFolders}
          setExpandedFolders={
            setData
              ? (ids) => setData({ ...data, expandedFolders: ids })
              : undefined
          }
          rememberExpanded={data.rememberExpanded}
        />
      )}
    </div>
  );
};

export default Bookmarks;
