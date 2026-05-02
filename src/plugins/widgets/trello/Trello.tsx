import "./Trello.sass";

import { FC, useCallback, useEffect, useMemo, useRef } from "react";
import { FormattedMessage } from "react-intl";

import useAuth from "../../../hooks/useAuth";
import { useFreshReducer } from "../../../hooks/useFreshReducer";
import { cacheReducer } from "./cacheReducer";
import { trelloAuthStore } from "./stores/trelloAuthStore";
import { defaultCache, Item, ListItems,Props, TrelloSession } from "./types";
import { Drag, DropPayload } from "./ui/Drag";
import { List } from "./ui/List";
import { getItems } from "./utils/api";

const Trello: FC<Props> = ({ cache = defaultCache, setCache }) => {
  const { authStatus, getSession } = useAuth<TrelloSession>(
    "trello",
    trelloAuthStore,
  );

  const dispatchUI = useFreshReducer(cacheReducer, cache, setCache);

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

  const fetchItemsForList = useCallback(
    async (listId: string): Promise<FetchResult> => {
      const session = await getSession();
      if (!session) return null;
      const items = await getItems(listId, session);
      return items ? { listId: listId, items } : null;
    },
    [getSession, getItems],
  );

  // Transform received data and render
  const receivedToListItems = useCallback(
    (received: FetchResult[]): void => {
      const updatedLists: ListItems[] = [];
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
    },
    [dispatchUI],
  );

  /**
   * Fetch items for all selected lists on first load
   */
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      console.log("TRELLO: fetching items for all selected lists");

      try {
        if (controller.signal.aborted) {
          return;
        }

        const listsWithData = await Promise.all(
          Object.values(cacheRef.current.lists).map((list) =>
            fetchItemsForList(list.listId),
          ),
        );

        if (controller.signal.aborted) {
          return;
        }

        receivedToListItems(listsWithData);
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error(`TRELLO ${(error as Error).message}`);
        }
      }
    };

    if (authStatus === "authenticated") {
      fetchData();
    }

    return () => controller.abort();
  }, [authStatus, receivedToListItems, fetchItemsForList]);

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

        receivedToListItems(listsWithData);
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Request Aborted");
        }
      }
    };

    revalidate();
    return () => controller.abort();
  }, [loadingListIds, receivedToListItems, fetchItemsForList]);

  const handleDrop = ({ dragItemId, dragType, dropZoneId }: DropPayload) => {
    console.log("TRELLO: DROPPED");
    console.log(
      `dragItemId: ${dragItemId}, dragType: ${dragType}, dropZoneId: ${dropZoneId}`,
    );
  };

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
            {cache.order.map((selectedList) => {
              const { items, status } = cache.lists[selectedList.id];
              return (
                <List
                  key={selectedList.id}
                  header={selectedList.name}
                  listId={selectedList.id}
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
