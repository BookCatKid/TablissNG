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

const TrelloSettings: FC<Props> = ({ data = defaultData, setData, cache = defaultCache, setCache }) => {
  const MAX_LISTS = 6; // maximum lists a user can select
  const { authState, authError, authenticate, signOut } = useAuth();
  const [selectedListCount, setSelectedListCount] = useState<number>(0);
  const [error, setError] = useState<boolean>(false);

  const [availableBoards, setAvailableBoards] = useState<{
    boards: Board[];
    loading: boolean;
  }>({ boards: [], loading: true });

  const [availableLists, setAvailableLists] = useState<{
    lists: List[];
    loading: boolean;
  }>({ lists: [], loading: true });

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
    const found = availableLists.lists.find((list: List) => list.id === listID);
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
   
    const updated = availableLists.lists.map((list: List) => { 
      return list.id === listID ? { ...list, watch: !list.watch } : list
    });

    // update settings UI
    setAvailableLists({
      ...availableLists,
      lists: updated,
    });

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

  // on load fetch available boards for use
  useEffect(() => {
    const effect = async () => {
      const boards = await getBoards();
      if (!boards) return; // add better error handling
      setAvailableBoards({
        boards: boards,
        loading: false,
      });

      // if the user has not yet selected a board
      // set a default for them using the first board
      if (!data.selectedID) {
        setData({...data, selectedID: boards[0].id});
      }
    };

    if (authState === "authenticated") {
      effect();
    }
  }, [authState]);

  // when a board is selected fetch the lists under it
  useEffect(() => {
    setAvailableLists({ ...availableLists, loading: true });
    const effect = async () => {
      if (!data.selectedID) return;
      const lists = await getLists(data.selectedID);
      if (!lists) return;

      const preferences = await getPreferences(data.selectedID);
      console.log("PREFERENCES ", preferences);

      let listsWithPreferences = lists;
      if (preferences) {
        listsWithPreferences = await applyPreferences(lists, preferences);
      }
      
      setAvailableLists({
        lists: listsWithPreferences,
        loading: false,
      });

      // load new fetching jobs into cache
      const filtered = listsWithPreferences.filter(list => list.watch);
      const responses = new Map<string, TrelloItemsResponse>();
      filtered.map(list => {
        console.log(list.name);
        responses.set(list.id, { listId: list.id, items: [], loading: true} as TrelloItemsResponse)
      });

      console.log("Filtered ", filtered);
      setCache({
        ...cache,
        order: filtered,
        responses: responses
      })
    };

    if (authState === "authenticated") {
      effect();
    }
  }, [data.selectedID, authState]);

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
          {availableBoards.loading ? (
            <div className="loading" style={{marginLeft: "4px"}}>
              Loading... <Spinner size={16} />
            </div>
            ) : 
            (
              <select 
                onChange={onBoardSelect} 
                defaultValue={data.selectedID === null ? availableBoards.boards[0].id : data.selectedID}
              >
                {availableBoards.boards.map((board: Board) => {
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
            { (availableLists.loading || availableBoards.loading) ? (
              <div className="loading">Loading... <Spinner size={16} /></div>
            ) : ( 
              availableLists.lists.map((list: List, index) => {
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
