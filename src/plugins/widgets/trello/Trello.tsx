import "./Trello.sass";

import { FC, useCallback, useEffect, useMemo, useRef } from "react";
import { FormattedMessage } from "react-intl";

import useAuth from "../../../hooks/useAuth";
import { useFreshReducer } from "../../../hooks/useFreshReducer";
import { cacheReducer } from "./cacheReducer";
import { trelloAuthStore } from "./stores/trelloAuthStore";
import { defaultCache, Item, List, Props, TrelloSession } from "./types";
import { Drag, DropPayload } from "./ui/Drag";
import { List as ListComponent } from "./ui/List";
import { getItems, moveCardToList } from "./utils/api";

const Trello: FC<Props> = ({ cache = defaultCache, setCache }) => {
  const { authStatus, getSession } = useAuth<TrelloSession>(
    "trello",
    trelloAuthStore,
  );

  const dispatchUI = useFreshReducer(cacheReducer, cache, setCache);

  // Keep track of latest version of cache
  const cacheRef = useRef(cache);

  // Track if any lists change their status to loading, indicating a new fetch is needed
  const loadingListIds = useMemo(
    () =>
      Object.values(cache.lists)
        .filter((l) => l.status === "LOADING")
        .map((l) => l.id)
        .join(","),
    [cache.lists],
  );

  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  // =================== Data fetching ==================

  type FetchResult = { id: string; name: string; items: Item[] } | null;

  const fetchItemsForList = useCallback(
    async (list: List): Promise<FetchResult | null> => {
      const session = await getSession();
      if (!session) return null;
      const items = await getItems(list.id, session);
      return items ? { id: list.id, name: list.name, items: items } : null;
    },
    [getSession, getItems],
  );

  // Transform received data and render
  const receivedToListItems = useCallback(
    (received: FetchResult[]): void => {
      const updatedLists: List[] = [];
      received.forEach((o) => {
        if (o) {
          updatedLists.push({
            id: o.id,
            name: o.name,
            items: o.items,
            selected: true,
            status: "COMPLETED",
          });
        }
      });

      dispatchUI({
        type: "UPDATE",
        order: cacheRef.current.order,
        lists: updatedLists,
      });
    },
    [dispatchUI],
  );

  // Fetch items on first load and when a lists' state changes
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    const controller = new AbortController();

    const fetchData = async () => {
      console.log("TRELLO: fetching items for lists");
      try {
        if (controller.signal.aborted) return;

        const fetchResults = await Promise.all(
          Object.values(cacheRef.current.lists).map((l) =>
            fetchItemsForList(l),
          ),
        );

        if (controller.signal.aborted) return;

        receivedToListItems(fetchResults);
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error(`TRELLO ${error.message}`);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, [authStatus, loadingListIds]);

  const handleDrop = useCallback(
    async (payload: DropPayload) => {
      if (
        !payload.dragItemId ||
        !payload.dropZoneId ||
        payload.dragType !== "ITEM"
      ) {
        return;
      }

      const dragParts = payload.dragItemId.split("-item-");
      const dropParts = payload.dropZoneId.split("-item-");
      if (dragParts.length !== 2 || dropParts.length !== 2) return;

      // Parse source and target
      const sourceListId = dragParts[0].replace("list-", "");
      const targetListId = dropParts[0].replace("list-", "");
      const sourceIndex = parseInt(dragParts[1], 10);
      const targetIndex = parseInt(dropParts[1], 10);
      if (isNaN(sourceIndex) || isNaN(targetIndex)) return;

      const currentCache = cacheRef.current;
      const sourceList = currentCache.lists[sourceListId];
      const targetList = currentCache.lists[targetListId];
      if (!sourceList || !targetList) return;

      const movedItem = sourceList.items[sourceIndex];
      if (!movedItem) return;

      if (sourceListId === targetListId && sourceIndex === targetIndex) return;

      // Update UI
      dispatchUI({
        type: "MOVE_ITEM",
        sourceListId,
        sourceIndex,
        targetListId,
        targetIndex,
      });

      let adjacentTarget = targetIndex;
      if (sourceListId === targetListId && sourceIndex < adjacentTarget) {
        adjacentTarget--;
      }

      const targetItemsWithoutCard = targetList.items.filter(
        (_, i) => !(sourceListId === targetListId && i === sourceIndex),
      );

      // Sync state with trello by applying the same move
      const session = await getSession();
      if (!session) return;

      await moveCardToList(
        movedItem.id,
        adjacentTarget,
        targetListId,
        targetItemsWithoutCard,
        session,
      );
    },
    [getSession, dispatchUI],
  );

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
          <Drag handleDrop={handleDrop}>
            {cache.order.map((listId) => {
              const { items, name, status } = cache.lists[listId];
              return (
                <ListComponent
                  key={listId}
                  header={name}
                  listId={listId}
                  items={items}
                  loading={status === "LOADING"}
                />
              );
            })}
          </Drag>
        </div>
      )}
    </>
  );
};

export default Trello;
