import React, { FC, useEffect, useState } from "react";
import { BoardPreferences, defaultData, Props } from "./types";
import Button from "../../../views/shared/Button";
import { FormattedMessage } from "react-intl";
import { runAuthFlow, checkAuth } from "./utils/auth";
import { getPreferences, setPreferences } from "./utils/preferences";
import { Board, List } from "./types";
import ListCheckbox from "./ui/ListCheckbox/ListCheckbox";
import Spinner from "./ui/Spinner/Spinner";
import { getBoards, getLists } from "./api";

const TrelloSettings: FC<Props> = ({ data = defaultData, setData }) => {
  const MAX_LISTENERS = 4; // maximum lists a user can select
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

  useEffect(() => {
    const effect = async () => {
      const auth = await checkAuth();
      setData({...data, authState: auth ? "authenticated" : "unauthenticated"});
    }
    effect();
  }, []);

  const onAuthenticateClick = async () => {
    setData({ ...data, authState: "pending"});
    try {
      await runAuthFlow();
      setData({ ...data, authState: "authenticated"});
      setError(false);
    } catch (err) {
      setError(true);
      setData({ ...data, authState: "unauthenticated"});
    }
  }

  const onSignout = async () => {
    await browser.storage.local.remove("trelloSessionToken");
    setData({ ...data, authState: "unauthenticated"});
  }

  const onListCheckboxSelect = (listID: string) => {
    const found = availableLists.lists.find((list: List) => list.id === listID);
    if (!found) {
      return;
    }

    if (found.watch) {
      // set to unchecked
      setSelectedListCount(count => count - 1);
    } else {
      // set to checked
      if (selectedListCount + 1 > MAX_LISTENERS) return;
      setSelectedListCount(count => count + 1); 
    }
   
    const updated = availableLists.lists.map((list: List) => { 
      return list.id === listID ? { ...list, watch: !list.watch } : list
    });


    // optimistically update UI state
    setAvailableLists({
      ...availableLists,
      lists: updated,
    });

    // fetch data in background then revalidate

    // get updated lists that are being watched
    const filtered = updated.filter((list: List ) => { return list.watch });
    // save local preferences
    const newPreferences: BoardPreferences = {selectedLists: filtered };
    setPreferences(data.selectedID, newPreferences);
    setData({...data, selectedLists: filtered});

  }

  useEffect(() => {
    // fetch available boards for use
    const effect = async () => {
      const boards = await getBoards();
      if (!!boards) {
        setAvailableBoards({
          ...availableBoards,
          boards: boards
        });
        
        setData({...data, selectedID: boards[0].id});
      }
    };

    if (data.authState === "authenticated") {
      effect();
    }
  }, [data.authState]);

  useEffect(() => {
    // when a board is selected pull the lists under it
    setAvailableLists({ ...availableLists, loading: true });
    const effect = async () => {
      if (!data.selectedID) return;
      const lists = await getLists(data.selectedID);
      if (!lists) return;

      // load preferences if they exist
      const preferences = await getPreferences(data.selectedID);
      if (preferences) {
        // apply preferences
        lists.forEach((list: List) => {
          const match = preferences.selectedLists.find(item => item.id === list.id);
          if (match) {
            list.watch = match.watch;
          }   
        });                  
      }

      setAvailableLists({
        lists: lists,
        loading: false,
      }); 
    };

    if (data.authState === "authenticated") {
      effect();
    }
  }, [data.selectedID, data.authState]);

  if (data.authState !== "authenticated") {
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
        <Button disabled={data.authState === "pending"} primary onClick={onAuthenticateClick}>
          { data.authState === "unauthenticated" ? "Authenticate" : "Authenticating..."}
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
          {availableBoards.loading && availableBoards.boards.length === 0 ? (
            <div className="loading" style={{marginLeft: "4px"}}>Loading... <Spinner size={16} /></div>
            ) : 
            (
              <select
                onChange={(event) =>
                  setData({ ...data, selectedID: event.target.value })
                }
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
            defaultMessage="Select up to 4 lists to watch"
            description="Select up to 4 lists to watch"
          />
          <div className="list-select-container">
            {availableLists.loading ? (
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
            defaultMessage="Sign Out"
            description="Sign Out"
          />
        </label>
        <Button primary onClick={onSignout}>Sign Out</Button>
      </div>
    </>
  );  
};

export default TrelloSettings;
