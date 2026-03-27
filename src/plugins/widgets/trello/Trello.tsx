import React, { FC, useEffect, useCallback, useRef } from "react";
import {
  Props,
  List,
  defaultCache,
  TrelloSession,
  isPlaceholder,
  isItem,
  RealOrPlaceholderItem,
  PlaceholderItem,
  FetchJob,
  Item,
  DraggedItemStyle,
} from "./types";
import "./Trello.sass";

import DisplayList from "./ui/DisplayList/DisplayList";
import DraggableItem from "./ui/DisplayList/DraggableItem";
import { getItems, moveCardToList } from "./utils/api";
import { trelloAuthStore } from "./stores/trelloAuthStore";
import useAuth from "../../../hooks/useAuth";
import { FormattedMessage } from "react-intl";
import { DragContextProvider, useDragContext } from "./contexts/DragContext";

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

  // Used for throttling updates with overlap callback to prevent flickering
  const lastOverlapUpdateRef = useRef<DOMHighResTimeStamp>(0);
  const THROTTLE_MS = 100;

  // =================== Data fetching ==================

  useEffect(() => {
    const effect = async () => {
      console.log("TRELLO: fetching items for all selected lists");
      const results = await Promise.all(
        Array.from(cache.responses.values()).map(async (response) => {
          if (!response.skeleton) {
            const session = await getSession();
            if (!session) return null;
            const items = await getItems(response.listId, session);
            return items ? { listId: response.listId, response, items } : null;
          }
        }),
      );

      const updatedResponses = new Map(cache.responses);
      results.forEach((result) => {
        if (result) {
          updatedResponses.set(result.listId, {
            ...result.response,
            loading: false,
            items: result.items,
          });
        }
      });

      setCache({
        ...cache,
        responses: updatedResponses,
      });
    };

    if (authStatus === "authenticated") {
      effect();
    }
  }, [authStatus]);

  useEffect(() => {
    const effect = async () => {
      console.log("TRELLO: fetching items for new jobs");
      await Promise.all(
        cache.responses.values().map(async (response) => {
          if (response.loading && !response.skeleton) {
            const session = await getSession();
            if (!session) return null;
            const items = await getItems(response.listId, session);
            if (items) {
              setCache({
                ...cache,
                responses: cache.responses.set(response.listId, {
                  ...response,
                  loading: false,
                  items: items,
                }),
              });
            }
          }
        }),
      );
    };
    effect();
  }, [cache.order]);

  // ================= Drag callbacks ==================

  const handleDrop = useCallback(
    async (
      item: Item,
      insertIndex: number,
      fromListId: string,
      toListId: string,
    ) => {
      const updatedResponses = new Map(cache.responses);
      const source = updatedResponses.get(fromListId);
      const destination = updatedResponses.get(toListId);

      if (source && destination) {
        const skeletonIndex = source.items.findIndex((i) => isPlaceholder(i));

        if (skeletonIndex !== -1) {
          let sourceItems = [...source.items];
          const destItems = [...destination.items];

          destItems.splice(insertIndex, 0, item);

          sourceItems = sourceItems.filter((i) => isItem(i));
          const updatedDestItems = destItems.filter((i) => isItem(i));

          updatedResponses.set(fromListId, { ...source, items: sourceItems });
          updatedResponses.set(toListId, {
            ...destination,
            items: updatedDestItems,
          });

          setCache({
            ...cache,
            responses: updatedResponses,
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

            const revalidated = new Map(cache.responses);
            if (updatedSourceItems) {
              revalidated.set(fromListId, {
                ...source,
                loading: false,
                items: updatedSourceItems,
              });
            }

            if (updatedDestinationItems) {
              revalidated.set(toListId, {
                ...destination,
                loading: false,
                items: updatedDestinationItems,
              });
            }

            setCache({ ...cache, responses: revalidated });
          }
        }
      }
    },
    [cache, setCache, getSession],
  );

  const handleDragCancel = useCallback(
    (sourceItem: Item, sourceItemIndex: number, sourceListId: string) => {
      const listIds = Array.from(cache.responses.keys());
      let updatedResponses = new Map(cache.responses);
      updatedResponses = clearPlaceholdersFromList(updatedResponses, listIds);

      const response = updatedResponses.get(sourceListId);
      if (!response) {
        console.error("TRELLO: failed to cancel");
        return;
      }

      const updatedItems = [...response.items];
      updatedItems.splice(sourceItemIndex, 0, sourceItem);

      updatedResponses.set(sourceListId, {
        ...response,
        items: updatedItems,
      });

      setCache({
        ...cache,
        responses: updatedResponses,
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

      const fetchJob = cache.responses.get(sourceListId);
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

      const updated: FetchJob = {
        ...fetchJob,
        items: updatedItems,
      };

      const updatedResponses = new Map(cache.responses);
      updatedResponses.set(sourceListId, updated);

      setCache({
        ...cache,
        responses: updatedResponses,
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
        const listIds = Array.from(cache.responses.keys()).filter(
          (i) => i !== sourceListId,
        );
        const updated = clearPlaceholdersFromList(
          new Map(cache.responses),
          listIds,
        );
        setCache({
          ...cache,
          responses: updated,
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

      const updatedResponses = new Map(cache.responses);
      const destination = updatedResponses.get(hoveredListId);
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

      const updated: FetchJob = {
        ...destination,
        items: items,
      };

      updatedResponses.set(hoveredListId, updated);

      setCache({
        ...cache,
        responses: updatedResponses,
      });
    },
    [cache, setCache],
  );

  /**
   * Clear all skeletons/placeholders from specified lists.
   * Returns an updated responses map — does not call setCache itself.
   */
  const clearPlaceholdersFromList = (
    responses: Map<string, FetchJob>,
    listIds: string[],
  ) => {
    const updatedResponses = new Map(responses);

    for (const listId of listIds) {
      const fetchJob = updatedResponses.get(listId);
      if (fetchJob) {
        updatedResponses.set(listId, {
          ...fetchJob,
          items: fetchJob.items.filter((i) => isItem(i)),
        });
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
            const response = cache.responses.get(list.id);
            return (
              <DisplayList
                key={list.id}
                header={list.name}
                listId={list.id}
                items={response?.items}
                loading={response?.loading}
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
