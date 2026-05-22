import "./Trello.sass";

import { FC, useCallback, useEffect, useMemo, useRef } from "react";
import { FormattedMessage } from "react-intl";

import useAuth from "../../../hooks/useAuth";
import { useFreshReducer } from "../../../hooks/useFreshReducer";
import { cacheReducer } from "./reducers";
import { trelloAuthStore } from "./stores/trelloAuthStore";
import { Card, defaultCache, List, Props, TrelloSession } from "./types";
import { Drag, DropPayload } from "./ui/Drag";
import { List as ListComponent } from "./ui/List";
import { getCards, moveCardToList } from "./utils/api";

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

  type FetchResult = { id: string; name: string; cards: Card[] } | null;

  const fetchCardsForList = useCallback(
    async (list: List): Promise<FetchResult | null> => {
      const session = await getSession();
      if (!session) return null;
      const cards = await getCards(list.id, session);
      return cards ? { id: list.id, name: list.name, cards: cards } : null;
    },
    [getSession],
  );

  // Transform received data and render
  const receivedToListCards = useCallback(
    (received: FetchResult[]): void => {
      const updatedLists: List[] = [];
      received.forEach((o) => {
        if (o) {
          updatedLists.push({
            id: o.id,
            name: o.name,
            cards: o.cards,
            selected: true,
            status: "COMPLETED",
          });
        }
      });

      dispatchUI({
        type: "UPDATE_LISTS",
        order: cacheRef.current.order,
        lists: updatedLists,
      });
    },
    [dispatchUI],
  );

  // Fetch cards on first load and when a lists' state changes
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    const controller = new AbortController();

    const fetchData = async () => {
      console.log("TRELLO: fetching cards for lists");
      try {
        if (controller.signal.aborted) return;

        const fetchResults = await Promise.all(
          Object.values(cacheRef.current.lists).map((l) =>
            fetchCardsForList(l),
          ),
        );

        if (controller.signal.aborted) return;

        receivedToListCards(fetchResults);
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error(`TRELLO ${error.message}`);
        }
      }
    };

    fetchData();
    return () => controller.abort();
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [authStatus, loadingListIds]);

  const handleDrop = useCallback(
    async (payload: DropPayload) => {
      if (
        !payload.dragCardId ||
        !payload.dropZoneId ||
        payload.dragType !== "ITEM"
      ) {
        return;
      }

      const dragSourceParts = payload.dragCardId.split("-card-");
      const dropSourceParts = payload.dropZoneId.split("-card-");
      if (dragSourceParts.length !== 2 || dropSourceParts.length !== 2) {
        return;
      }

      // Parse source and target
      const sourceListId = dragSourceParts[0].replace("list-", "");
      const targetListId = dropSourceParts[0].replace("list-", "");
      const sourceIndex = parseInt(dragSourceParts[1], 10);
      const targetIndex = parseInt(dropSourceParts[1], 10);
      if (isNaN(sourceIndex) || isNaN(targetIndex)) return;

      const currentCache = cacheRef.current;
      const sourceList = currentCache.lists[sourceListId];
      const targetList = currentCache.lists[targetListId];
      if (!sourceList || !targetList) return;

      const movedCard = sourceList.cards[sourceIndex];
      if (!movedCard) return;

      if (sourceListId === targetListId && sourceIndex === targetIndex) return;

      // Update UI
      dispatchUI({
        type: "MOVE_CARD",
        sourceListId,
        sourceIndex,
        targetListId,
        targetIndex,
      });

      // Sync state with trello by applying the same move
      let adjustedTargetIndex = targetIndex;

      // Handle cases where the card is moved lower in the same list
      if (sourceListId === targetListId && sourceIndex < targetIndex) {
        adjustedTargetIndex--;
      }

      const targetCardsWithoutCard = targetList.cards.filter(
        (_, i) => !(sourceListId === targetListId && i === sourceIndex),
      );

      const session = await getSession();
      if (!session) return;

      await moveCardToList(
        movedCard.id,
        adjustedTargetIndex,
        targetListId,
        targetCardsWithoutCard,
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
          defaultMessage="Sign into Trello to use me"
          description="Sign into Trello to use me"
        />
      ) : !cache.order || (!!cache && cache.order.length === 0) ? (
        <FormattedMessage
          id="plugins.trello.noListsMessage"
          defaultMessage="Add some lists to view"
          description="Add some lists to view"
        />
      ) : (
        <div className="display-list-container">
          <Drag handleDrop={handleDrop}>
            {cache.order.map((listId) => {
              const { cards, name, status } = cache.lists[listId];
              return (
                <ListComponent
                  key={listId}
                  header={name}
                  listId={listId}
                  cards={cards}
                  loading={status === "LOADING"}
                  dispatchUI={dispatchUI}
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
