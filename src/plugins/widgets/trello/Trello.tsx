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

  const { dragState, endDrag, isDragging } = useDragContext();

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
        // Find position of skeleton
        const skeletonIndex = source.items.findIndex((i) => isSkeleton(i));

        if (skeletonIndex !== -1) {
          let sourceItems = [...source.items];
          let destItems = [...destination.items];
          console.log("Adding item");
          console.log(item);

          destItems.push(item);

          // Clear placeholders
          sourceItems = sourceItems.filter((i) => isItem(i));
          destItems = destItems.filter((i) => isItem(i));

          updatedResponses.set(fromListId, { ...source, items: sourceItems });
          updatedResponses.set(toListId, { ...destination, items: destItems });

          // Update UI
          setCache({
            ...cache,
            responses: updatedResponses,
          });

          // Persist on Trello's side
          // const session = await getSession();
          // if (session) {
          //   await moveCardToList(item.id, toListId, session);
          // }
        }
      }
    },
    [cache, setCache, getSession],
  );

  // Restore the currently dragging item back to where it came from
  const handleDragCancel = useCallback(
    async (sourceItemIndex: number, sourceListId: string) => {
      console.log("Handling cancel");
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

  const handleDragStart = useCallback(
    async (
      item: Item,
      sourceItemIndex: number,
      sourceListId: string,
      style: DraggedItemStyle,
    ) => {
      // Place skeletons in item's original position
      console.log("Inserting skeleton for drag source");
      const { width: skeletonWidth, height: skeletonHeight } = style.size;

      const fetchJob = cache.responses.get(sourceListId);
      if (!fetchJob) {
        return;
      }

      const notSourceItem = (i: RealOrSkeletonItem) =>
        isItem(i) && i.id !== item.id;
      const updatedItems = fetchJob.items.filter(notSourceItem);

      // Replace removed source item with placeholder
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

  // Handle pointer up to end drag
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerUp = () => {
      console.log("POINTER UP");
      endDrag(handleDrop, handleDragCancel);
    };

    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, [isDragging, endDrag, handleDrop, handleDragCancel]);

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
                onDragStart={handleDragStart}
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
