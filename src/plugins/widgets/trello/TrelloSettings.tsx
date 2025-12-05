import React, { ChangeEvent, FC, useEffect, useState } from "react";
import { BoardPreferences, defaultCache, defaultData, Props, TrelloItemsResponse } from "./types";
import Button from "../../../views/shared/Button";
import { FormattedMessage } from "react-intl";
import { runAuthFlow } from "./utils/auth";
import { applyPreferences, getPreferences, setPreferences } from "./utils/preferences";
import { Board, List } from "./types";
import ListCheckbox from "./ui/ListCheckbox/ListCheckbox";
import Spinner from "./ui/Spinner/Spinner";
import useAuth from "./hooks/useAuth";
import { getBoards, getLists } from "./utils/api";
import useBoards from "./hooks/useBoards";
import useLists from "./hooks/useLists";

const TrelloSettings: FC<Props> = ({ data = defaultData, setData, cache = defaultCache, setCache }) => {
  const MAX_LISTS = 6; // maximum lists a user can select
  const { authState, authError, authenticate, signOut } = useAuth();
  const { boards, isLoading: boardsLoading } = useBoards(data, setData, authState);
  const { lists, setLists, isLoading: listsLoading } = useLists(data, cache, setCache, authState);
  const [selectedListCount, setSelectedListCount] = useState<number>(0);
  const [error, setError] = useState<boolean>(false);

  const onAuthenticateClick = async () => {
    await authenticate();
    if (!data.selectedID) {
      // first-time sign in / sign in after reset
      setCache({...cache });
      setError(false);
      return;
    }

    // attempt to load preferences
    const preferences = await getPreferences(data.selectedID);
    if (!preferences) {
      // error caused by selected id that no longer exists
      setCache({ ...cache });
      setError(true);
    } else {
      setData({ ...data, selectedLists: preferences.selectedLists });
      setCache({ ...cache });
      setError(false);
    }
  }

  const onSignout = async () => {
    await signOut();
    // reset data and clear cache
    setData(defaultData);
    setCache(defaultCache);
  }

  const onBoardSelect = (event: ChangeEvent<HTMLSelectElement>) => {
   setData({ ...data, selectedID: event.target.value });
    setCache(defaultCache);
  }

  const onListCheckboxSelect = (listID: string) => {
    const found = lists.find((list: List) => list.id === listID);
    if (!found) {
      return;
    }

    const operation: "ADD" | "REMOVE" = found.watch ? "REMOVE" : "ADD";
    if (operation === "REMOVE") {
      // set to unchecked
      setSelectedListCount(count => count - 1);
    } else {
      // set to checked
      if (selectedListCount + 1 > MAX_LISTS) return;
      setSelectedListCount(count => count + 1); 
    }
   
    const updated = lists.map((list: List) => { 
      return list.id === listID ? { ...list, watch: !list.watch } : list
    });

    // update settings UI
    setLists(updated);

    // get updated lists that are being watched
    const filtered = updated.filter((list: List ) => { return list.watch });
    const newPreferences: BoardPreferences = {selectedLists: filtered };
    setPreferences(data.selectedID, newPreferences); 
    setData({...data, selectedLists: filtered});

    // update UI
    if (operation === "ADD") {
      // update with new order of display and
      // create new pending fetch operation
      setCache({
        ...cache, 
        order: filtered, 
        responses: cache.responses.set(listID, { 
          listId: listID, 
          items: [], 
          loading: true } as TrelloItemsResponse
        )
      });
    } else {
      cache.responses.delete(listID);
      setCache({
        ...cache,
        order: filtered
      });
    }
  }

  if (authState !== "authenticated") {
    return (
      <>
        <label>
          { error ? 
            <FormattedMessage 
              id="plugins.trello.authenticate.error"
              defaultMessage="Error occurred during authentication"
              description="Error occurred during authentication"
            />
            : 
            <FormattedMessage
              id="plugins.trello.authenticate"
              defaultMessage="Sign in With Trello"
              description="Sign in with Trello"
            />
          }
        </label>
        <Button disabled={authState === "pending"} primary onClick={onAuthenticateClick}>
          { authState === "unauthenticated" ? "Authenticate" : "Authenticating..." }
        </Button>
      </>
    );
  }

  return (
    <>
      <label>
        <FormattedMessage
          id="plugins.trello.boardSelect"
          defaultMessage="Select your board"
          description="Select your board"
        />
        <div className="board-select-container">
          {boardsLoading ? (
            <div className="loading" style={{marginLeft: "4px"}}>
              Loading... <Spinner size={16} />
            </div>
            ) : 
            (
              <select 
                onChange={onBoardSelect} 
                defaultValue={data.selectedID === null ? boards[0].id : data.selectedID}
              >
                {boards.map((board: Board) => {
                  return (
                    <option key={board.id} value={board.id}>
                      {board.name}
                    </option>
                  );
                })}
              </select>
            )}
        </div>
      </label>
      <div className="offset">
        <label>
          <FormattedMessage
            id="plugins.trello.listSelect"
            defaultMessage={`Select up to ${MAX_LISTS} lists to watch`}
            description={`Select up to ${MAX_LISTS} lists to watch`}
          />
          <div className="list-select-container">
            { listsLoading || boardsLoading ? (
              <div className="loading">Loading... <Spinner size={16} /></div>
            ) : ( 
              lists.map((list: List, index) => {
                return (
                  <ListCheckbox   
                    key={list.id}
                    checked={list.watch} 
                    index={index} 
                    listID={list.id} 
                    label={list.name} 
                    onChange={onListCheckboxSelect} 
                  />
                );
              })
            )}
          </div>
        </label>
      </div>
      <div className="offset">
        <label>
          <FormattedMessage
            id="plugins.trello.logout"
            defaultMessage="Signing out will clear preferences"
            description="Signing out will clear all preferences"
          />
        </label>
        <Button primary onClick={onSignout}>Sign Out</Button>
      </div>
    </>
  );  
};

export default TrelloSettings;
