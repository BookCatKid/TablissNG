import React, { ChangeEvent, FC, useRef } from "react";
import { BoardPreference, createFetchJob, defaultCache, defaultData, Props, FetchJob } from "./types";
import Button from "../../../views/shared/Button";
import { FormattedMessage } from "react-intl";
import { Board, List } from "./types";
import ListCheckbox from "./ui/ListCheckbox/ListCheckbox";
import Spinner from "./ui/Spinner/Spinner";
import useAuth from "./hooks/useAuth";
import useBoards from "./hooks/useBoards";
import useLists from "./hooks/useLists";

const TrelloSettings: FC<Props> = ({ data = defaultData, setData, cache = defaultCache, setCache }) => {
  const MAX_LISTS = 6; // maximum lists a user can select
  const { authStatus: authState, authError, signIn, signOut } = useAuth();
  const { boards, isLoading: boardsLoading } = useBoards(data, setData);
  const { 
    lists, 
    setLists, 
    isLoading: listsLoading, 
    updateUI,
    updateUIWithSkeletons} = useLists(data, cache, setCache);
  const pendingJobsRef = useRef<Set<FetchJob>>(new Set<FetchJob>());
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const DEBOUNCE_INTERVAL = 550;

  const onAuthenticateClick = async () => {
    await signIn();
  }

  const onSignout = async () => {
    await signOut();
    // reset data and clear cache
    setData(defaultData);
    setCache(defaultCache);
  }

  const onBoardSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    setData({ ...data, selectedID: event.target.value });
    // reset all cache except auth state
    setCache({
      ...cache, 
      order: [], 
      responses: new Map<string, FetchJob>() 
    });
  }

  const onListCheckboxSelect = (listID: string) => {
    const found = lists.find((list: List) => list.id === listID);
    if (!found) {
      return;
    }

    let updatedListCount = lists.filter(l => l.watch).length;
    const action: "ADD" | "REMOVE" = found.watch ? "REMOVE" : "ADD";
    if (action === "REMOVE") {
      pendingJobsRef.current.forEach(job => job.listId === listID && pendingJobsRef.current.delete(job));
    } else {
      if (updatedListCount + 1 > MAX_LISTS) return;
      pendingJobsRef.current.add(createFetchJob(listID));
    }
   
    // update the settings UI
    const updatedOptions = lists.map((list: List) => { 
      return list.id === listID ? { ...list, watch: !list.watch } : list
    });

    setLists(updatedOptions);
    const selectedLists = updatedOptions.filter((list: List) => list.watch);
    const newPreference: BoardPreference = { boardId: data.selectedID!, lists: selectedLists };
      const updated = {
        ...data.preferences,
        [data.selectedID!]: newPreference,
      };
      setData({ ...data, preferences: updated });

    // optimistically update UI with skeletons
    console.log("TRELLO: Updating skeletons");
    updateUIWithSkeletons(updatedOptions.filter((list: List) => list.watch), pendingJobsRef.current);

    // debouncing logic for rapid selection
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      // update the UI and set the skeleton jobs to actual jobs and new selections
      updateUI(listID, selectedLists, pendingJobsRef.current, action);
      pendingJobsRef.current.clear();
    }, DEBOUNCE_INTERVAL);
  }

  if (authState !== "authenticated") {
    return (
      <>
        <label>
          { authError ? 
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
