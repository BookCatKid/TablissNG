import React, { FC, useEffect, useCallback } from "react";
import {
  Props,
  List,
  defaultCache,
  TrelloSession,
  isSkeleton,
  isItem,
  RealOrSkeletonItem,
  SkeletonItem,
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

  const { registerCallbacks, isDragging } = useDragContext();

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
      console.log("Handling drop");
      console.log(insertIndex);
      const updatedResponses = new Map(cache.responses);
      const source = updatedResponses.get(fromListId);
      const destination = updatedResponses.get(toListId);

      if (source && destination) {
        console.log("SOURCE ITEMS ", source.items);
        const skeletonIndex = source.items.findIndex((i) => isSkeleton(i));

        if (skeletonIndex !== -1) {
          let sourceItems = [...source.items];
          let destItems = [...destination.items];
          console.log("Adding item");
          console.log(item);

          destItems.push(item);

          sourceItems = sourceItems.filter((i) => isItem(i));
          destItems = destItems.filter((i) => isItem(i));

          updatedResponses.set(fromListId, { ...source, items: sourceItems });
          updatedResponses.set(toListId, { ...destination, items: destItems });

          setCache({
            ...cache,
            responses: updatedResponses,
          });

          // const session = await getSession();
          // if (session) {
          //   await moveCardToList(item.id, toListId, session);
          // }
        }
      }
    },
    [cache, setCache, getSession],
  );

  const handleDragCancel = useCallback(
    (sourceItem: Item, sourceItemIndex: number, sourceListId: string) => {
      console.log("Handling cancel");
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
      console.log("Inserting skeleton for drag source");
      const { width: skeletonWidth, height: skeletonHeight } = style.size;

      const fetchJob = cache.responses.get(sourceListId);
      if (!fetchJob) {
        return;
      }

      const notSourceItem = (i: RealOrSkeletonItem) =>
        isItem(i) && i.id !== item.id;
      const updatedItems = fetchJob.items.filter(notSourceItem);

      updatedItems.splice(sourceItemIndex, 0, {
        width: skeletonWidth,
        height: skeletonHeight,
      } as SkeletonItem);

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

      const updatedResponses = new Map(cache.responses);
      const destination = updatedResponses.get(hoveredListId);
      if (!destination) {
        return;
      }

      let items = [...destination.items];
      items = items.filter((i) => isItem(i));
      const { width: skeletonWidth, height: skeletonHeight } = style!.size;

      // hoveredItemIndex now correctly accounts for any existing placeholder
      // in the list because DragContext builds its index from a merged
      // (real items + placeholder element) sorted list
      items.splice(hoveredItemIndex, 0, {
        width: skeletonWidth,
        height: skeletonHeight,
      } as SkeletonItem);

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
