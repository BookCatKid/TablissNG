import React, { FC, useEffect } from "react";
import { Props, List, defaultCache, TrelloSession } from "./types";
import "./Trello.sass";

import DisplayList from "./ui/DisplayList/DisplayList";
import { getItems } from "./utils/api";
import { trelloAuthStore } from "./stores/trelloAuthStore";
import useAuth from "../../../hooks/useAuth";
import { FormattedMessage } from "react-intl";

const Trello: FC<Props> = ({ cache = defaultCache, setCache }) => {
  const { authStatus, getSession } = useAuth<TrelloSession>(
    "trello",
    trelloAuthStore,
  );

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
                items={response?.items}
                loading={response?.loading}
              />
            );
          })}
        </div>
      )}
    </>
  );
};

export default Trello;
