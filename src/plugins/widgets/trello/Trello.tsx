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

  const { dragState, endDrag, isDragging } = useDragContext();

  // Insert skeleton item at drag source
  useEffect(() => {
    // Remove drag source item and replace with a skeleton
    if (!dragState) {
      return;
    }

    console.log("Inserting skeleton for drag source");
    const skeletonWidth = dragState.elementStyle!.size.width;
    const skeletonHeight = dragState.elementStyle!.size.height;

    const fetchJob = cache.responses.get(dragState.sourceListId);
    if (!fetchJob) {
      return;
    }

    const notSourceItem = (item: RealOrSkeletonItem) =>
      isItem(item) && item.id !== dragState.item.id;
    const updatedItems = fetchJob.items.filter(notSourceItem);

    // Replace removed source item with skeleton
    updatedItems.splice(dragState.sourceItemIndex, 0, {
      width: skeletonWidth,
      height: skeletonHeight,
    } as SkeletonItem);

    const updated: FetchJob = {
      ...fetchJob,
      items: updatedItems,
    };

    const updatedResponses = new Map(cache.responses);
    updatedResponses.set(dragState.sourceListId, updated);

    setCache({
      ...cache,
      responses: updatedResponses,
    });

    return () => {
      // Clear skeletons
    };
  }, [dragState]);

  // fetch data on page load
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
        // resolve jobs
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

  // fetch data when selected lists are changed
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

  // Handle moving an item from one list to another
  const handleDrop = useCallback(
    async (
      itemId: string,
      insertIndex: number,
      fromListId: string,
      toListId: string,
    ) => {
      console.log(insertIndex);
      const updatedResponses = new Map(cache.responses);
      const source = updatedResponses.get(fromListId);
      const destination = updatedResponses.get(toListId);

      if (source && destination) {
        const nonSkeletons = source.items.filter((item) => isSkeleton(item));
        const itemIndex = nonSkeletons.findIndex((i) => i.id === itemId);
        if (itemIndex !== -1) {
          const [item] = source.items.splice(itemIndex, 1);
          destination.items.unshift(item);

          // Update UI
          setCache({
            ...cache,
            responses: updatedResponses,
          });

          // Persist on Trello's side
          const session = await getSession();
          if (session) {
            await moveCardToList(itemId, toListId, session);
          }
        }
      }
    },
    [cache, setCache, getSession],
  );

  // Restore the currently dragging item back to where it came from
  const handleCancel = useCallback(
    async (sourceItemIndex: number, sourceListId: string) => {
      const fetchJob = cache.responses.get(sourceListId);
      if (!fetchJob) {
        return;
      }

      if (!dragState) {
        return;
      }

      // Find the skeleton item at the sourceItemIndex
      const items = fetchJob.items;
      const itemAtSourceIndex = items[sourceItemIndex];

      // Check if there's actually a skeleton at the source index
      if (isSkeleton(itemAtSourceIndex)) {
        // Find the original item by ID
        const originalItem = dragState.item;
        if (originalItem) {
          console.log("TRELLO: Found original item");
          const updatedItems = [...fetchJob.items];
          updatedItems[sourceItemIndex] = originalItem;

          const updatedResponses = new Map(cache.responses);
          updatedResponses.set(sourceListId, {
            ...fetchJob,
            items: updatedItems,
          });

          // Update UI
          setCache({
            ...cache,
            responses: updatedResponses,
          });
        }
      }
    },
    [cache, setCache],
  );

  // Handle pointer up to end drag
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerUp = () => {
      console.log("POINTER UP");
      endDrag(handleDrop, handleCancel);
    };

    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, [isDragging, endDrag, handleDrop, handleCancel]);

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
          {/* Render the floating drag preview when dragging */}
          {isDragging && <DraggableItem />}
        </div>
      )}
    </>
  );
};

export default Trello;
