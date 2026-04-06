import "./Trello.sass";

import { FC, useCallback, useEffect, useMemo,useRef } from "react";
import { FormattedMessage } from "react-intl";

import useAuth from "../../../hooks/useAuth";
import { useFreshReducer } from "../../../hooks/useFreshReducer";
import { cacheReducer } from "./cacheReducer";
import { DragContextProvider, useDragContext } from "./contexts/DragContext";
import { trelloAuthStore } from "./stores/trelloAuthStore";
import {
  defaultCache,
  DraggedItemStyle,
  isItem,
  isPlaceholder,
  Item,
  List,
  PlaceholderItem,
  Props,
  RealOrPlaceholderItem,
  TrelloSession,
  UIList,
} from "./types";
import DisplayList from "./ui/DisplayList/DisplayList";
import DraggableItem from "./ui/DisplayList/DraggableItem";
import { getItems, moveCardToList } from "./utils/api";

const Trello: FC<Props> = (props) => {
  return (
    <DragContextProvider>
      <TrelloContent {...props} />
    </DragContextProvider>
  );
};

const TrelloContent: FC<Props> = ({ cache = defaultCache, setCache }) => {
  const { authStatus, getSession } = useAuth<TrelloSession>(
    "trello",
    trelloAuthStore,
  );

  const { registerCallbacks, unregisterItemRef, isDragging } = useDragContext();
  const dispatchUI = useFreshReducer(cacheReducer, cache, setCache);

  // Used for throttling updates with overlap callback to prevent flickering
  const lastOverlapUpdateRef = useRef<DOMHighResTimeStamp>(0);
  const THROTTLE_MS = 100;

  // Keep track of latest version of cache
  const cacheRef = useRef(cache);

  // Track if any lists change their status to loading
  const loadingListIds = useMemo(
    () =>
      Object.values(cache.lists)
        .filter((l) => l.status === "LOADING")
        .map((l) => l.listId)
        .join(","),
    [cache.lists],
  );

  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  // =================== Data fetching ==================

  type FetchResult = { listId: string; items: Item[] } | null;

  const fetchItemsForList = async (listId: string): Promise<FetchResult> => {
    const session = await getSession();
    if (!session) return null;
    const items = await getItems(listId, session);
    return items ? { listId: listId, items } : null;
  };

  // Convert received data into UILists and render
  const receivedToUILists = (received: FetchResult[]): void => {
    const updatedLists: UIList[] = [];
    received.forEach((obj) => {
      if (obj) {
        updatedLists.push({
          listId: obj.listId,
          items: obj.items,
          status: "COMPLETED",
        });
      }
    });

    dispatchUI({
      type: "UPDATE",
      order: cacheRef.current.order,
      lists: updatedLists,
    });
  };

  /**
   * Fetch items for all selected lists on first load
   */
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      console.log("TRELLO: fetching items for all selected lists");

      try {
        if (controller.signal.aborted) {
          console.log("Aborting before fetching");
          return;
        }

        const listsWithData = await Promise.all(
          Object.values(cacheRef.current.lists).map((list) =>
            fetchItemsForList(list.listId),
          ),
        );

        if (controller.signal.aborted) {
          console.log("Aborting after fetching");
          return;
        }

        receivedToUILists(listsWithData);
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Request aborted");
        }
      }
    };

    if (authStatus === "authenticated") {
      fetchData();
    }

    return () => controller.abort();
  }, [authStatus]);

  /**
   * Refetch data when any item's state becomes set to LOADING
   */
  useEffect(() => {
    const controller = new AbortController();
    const revalidate = async () => {
      try {
        if (controller.signal.aborted) {
          console.log("Aborted before fetch");
          return;
        }

        console.log("TRELLO: fetching items for new jobs");
        const listsWithData = await Promise.all(
          Object.values(cacheRef.current.lists).map((list) =>
            fetchItemsForList(list.listId),
          ),
        );

        if (controller.signal.aborted) {
          console.log("Aborting after fetching");
          return;
        }

        receivedToUILists(listsWithData);
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Request Aborted");
        }
      }
    };

    revalidate();
    return () => controller.abort();
  }, [loadingListIds]);

  // ================= Drag callbacks ==================

  const handleDrop = useCallback(
    async (
      item: Item,
      insertIndex: number,
      fromListId: string,
      toListId: string,
    ) => {
      const updatedResponses = { ...cacheRef.current.lists };
      const source = updatedResponses[fromListId];
      const destination = updatedResponses[toListId];

      if (source && destination) {
        const skeletonIndex = source.items.findIndex((i) => isPlaceholder(i));

        if (skeletonIndex !== -1) {
          let sourceItems = [...source.items];
          const destItems = [...destination.items];

          destItems.splice(insertIndex, 0, item);

          sourceItems = sourceItems.filter((i) => isItem(i));
          const updatedDestItems = destItems.filter((i) => isItem(i));

          updatedResponses[fromListId] = { ...source, items: sourceItems };
          updatedResponses[toListId] = {
            ...destination,
            items: updatedDestItems,
          };

          setCache({
            ...cache,
            lists: updatedResponses,
          });

          const session = await getSession();
          console.log("SESSION ", session);

          if (session) {
            // Update positions on trello
            await moveCardToList(
              item.id,
              insertIndex,
              toListId,
              updatedDestItems,
              session,
            );

            // Revalidate both lists to update positions using Trello as the source of truth
            const [updatedSourceItems, updatedDestinationItems] =
              await Promise.all([
                getItems(fromListId, session),
                await getItems(toListId, session),
              ]);

            const revalidated = { ...cacheRef.current.lists };
            if (updatedSourceItems) {
              revalidated[fromListId] = {
                ...source,
                status: "COMPLETED",
                items: updatedSourceItems,
              };
            }

            if (updatedDestinationItems) {
              revalidated[toListId] = {
                ...destination,
                status: "COMPLETED",
                items: updatedDestinationItems,
              };
            }

            setCache({ ...cache, lists: revalidated });
          }
        }
      }
    },
    [cache, setCache, getSession],
  );

  const handleDragCancel = useCallback(
    (sourceItem: Item, sourceItemIndex: number, sourceListId: string) => {
      const listIds = Object.keys(cacheRef.current.lists);
      const updatedResponses = clearPlaceholdersFromList(
        { ...cacheRef.current.lists },
        listIds,
      );

      const response = updatedResponses[sourceListId];
      if (!response) {
        console.error("TRELLO: failed to cancel");
        return;
      }

      const updatedItems = [...response.items];
      updatedItems.splice(sourceItemIndex, 0, sourceItem);

      updatedResponses[sourceListId] = {
        ...response,
        items: updatedItems,
      };

      setCache({
        ...cache,
        lists: updatedResponses,
      });
    },
    [cache, setCache],
  );

  const handleDragStart = useCallback(
    (
      item: Item,
      sourceItemIndex: number,
      sourceListId: string,
      style: DraggedItemStyle,
    ) => {
      const { width: skeletonWidth, height: skeletonHeight } = style.size;

      const fetchJob = cache.lists[sourceListId];
      if (!fetchJob) {
        return;
      }
      unregisterItemRef(sourceListId, item);

      const notSourceItem = (i: RealOrPlaceholderItem) =>
        isItem(i) && i.id !== item.id;
      const updatedItems = fetchJob.items.filter(notSourceItem);

      updatedItems.splice(sourceItemIndex, 0, {
        width: skeletonWidth,
        height: skeletonHeight,
      } as PlaceholderItem);

      const updated: UIList = {
        ...fetchJob,
        items: updatedItems,
      };

      const updatedResponses = { ...cache.lists };
      updatedResponses[sourceListId] = updated;

      setCache({
        ...cache,
        lists: updatedResponses,
      });
    },
    [cache, setCache],
  );

  const handleDragItemOverlap = useCallback(
    (
      sourceListId: string,
      hoveredItemIndex: number | null,
      hoveredListId: string | null,
      style: DraggedItemStyle | null,
    ) => {
      if (!hoveredListId) {
        const listIds = Object.keys(cache.lists).filter(
          (i) => i !== sourceListId,
        );
        const updated = clearPlaceholdersFromList({ ...cache.lists }, listIds);
        setCache({
          ...cache,
          lists: updated,
        });
        return;
      }

      if (hoveredItemIndex === null) {
        return;
      }

      // Throttle updates
      const now = performance.now();
      if (now - lastOverlapUpdateRef.current < THROTTLE_MS) return;
      lastOverlapUpdateRef.current = now;

      const updatedResponses = { ...cache.lists };
      const destination = updatedResponses[hoveredListId];
      if (!destination) {
        return;
      }

      let items = [...destination.items];
      items = items.filter((i) => isItem(i));
      const { width: skeletonWidth, height: skeletonHeight } = style!.size;

      // Insert placeholder
      items.splice(hoveredItemIndex, 0, {
        width: skeletonWidth,
        height: skeletonHeight,
      } as PlaceholderItem);

      const updated: UIList = {
        ...destination,
        items: items,
      };

      updatedResponses[hoveredListId] = updated;

      setCache({
        ...cache,
        lists: updatedResponses,
      });
    },
    [cache, setCache],
  );

  /**
   * Clear all skeletons/placeholders from specified lists.
   * Returns an updated responses map — does not call setCache itself.
   */
  const clearPlaceholdersFromList = (
    responses: Record<string, UIList>,
    listIds: string[],
  ) => {
    const updatedResponses = { ...responses };

    for (const listId of listIds) {
      const fetchJob = updatedResponses[listId];
      if (fetchJob) {
        updatedResponses[listId] = {
          ...fetchJob,
          items: fetchJob.items.filter((i) => isItem(i)),
        };
      }
    }

    return updatedResponses;
  };

  useEffect(() => {
    registerCallbacks(
      handleDragStart,
      handleDrop,
      handleDragItemOverlap,
      handleDragCancel,
    );
  }, [
    registerCallbacks,
    handleDragStart,
    handleDrop,
    handleDragItemOverlap,
    handleDragCancel,
  ]);

  console.log(cache.lists);

  return (
    <>
      {authStatus !== "authenticated" ? (
        <FormattedMessage
          id="plugins.trello.unauthenticatedMessage"
          defaultMessage={"Sign into Trello to use me"}
          description={"Sign into Trello to use me"}
        />
      ) : !cache.order || (!!cache && cache.order.length === 0) ? (
        <FormattedMessage
          id="plugins.trello.noListsMessage"
          defaultMessage={"Add some lists to view"}
          description={"Add some lists to view"}
        />
      ) : (
        <div className="display-list-container">
          {cache.order.map((list: List) => {
            const response = cache.lists[list.id];
            return (
              <DisplayList
                key={list.id}
                header={list.name}
                listId={list.id}
                items={response?.items}
                loading={response?.status === "LOADING"}
              />
            );
          })}
          {isDragging && <DraggableItem />}
        </div>
      )}
    </>
  );
};

export default Trello;
