import React, { ChangeEvent, FC } from "react";
import {
  BoardPreference,
  createUIList,
  defaultCache,
  defaultData,
  Props,
  TrelloSession,
} from "./types";
import Button from "../../../views/shared/Button";
import { FormattedMessage } from "react-intl";
import { Board, List } from "./types";
import ListCheckbox from "./ui/ListCheckbox/ListCheckbox";
import { Spinner } from "../../shared";
import useAuth from "../../../hooks/useAuth";
import { trelloAuthStore } from "./stores/trelloAuthStore";
import useBoards from "./hooks/useBoards";
import useLists from "./hooks/useLists";
import { trelloAuthFlow, onTrelloSignOut } from "./utils/auth";

const TrelloSettings: FC<Props> = ({
  data = defaultData,
  setData,
  cache = defaultCache,
  setCache,
}) => {
  const {
    authStatus: authState,
    authError,
    signIn,
    signOut,
  } = useAuth<TrelloSession>("trello", trelloAuthStore);

  const { boards, isLoading: boardsLoading } = useBoards(data, setData);

  const { lists, setLists, isLoading: listsLoading } = useLists(data, setCache);

  const onAuthenticateClick = async () => {
    await signIn(trelloAuthFlow);
  };

  const onSignout = async () => {
    await signOut(onTrelloSignOut);
    setCache(defaultCache);
  };

  const onBoardSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    setData({ ...data, selectedID: event.target.value });
    setCache(defaultCache);
  };

  const onListCheckboxSelect = (listID: string) => {
    const found = lists.find((list: List) => list.id === listID);
    if (!found) {
      return;
    }

    const action: "ADD" | "REMOVE" = found.watch ? "REMOVE" : "ADD";

    const updatedUILists = new Map(cache.lists);
    const newUIList = createUIList(listID);

    if (action === "ADD") {
      updatedUILists.set(listID, newUIList);
    } else {
      updatedUILists.delete(listID);
    }

    // update the settings UI
    // to change the watch status for the checked list
    const updatedOptions = lists.map((list: List) => {
      return list.id === listID ? { ...list, watch: !list.watch } : list;
    });
    setLists(updatedOptions);

    // Will be made redundant after refactor to reducer
    const selectedLists = updatedOptions.filter((list: List) => list.watch);
    const newPreference: BoardPreference = {
      boardId: data.selectedID!,
      lists: selectedLists,
    };

    const updated = {
      ...data.preferences,
      [data.selectedID!]: newPreference,
    };

    setData({ ...data, preferences: updated });

    // Update UI
    setCache({
      ...cache,
      order: selectedLists,
      lists: updatedUILists,
    });
  };

  if (authState !== "authenticated") {
    return (
      <>
        <label>
          {authError ? (
            <FormattedMessage
              id="plugins.trello.authenticate.error"
              defaultMessage="Error occurred during authentication"
              description="Error occurred during authentication"
            />
          ) : (
            <FormattedMessage
              id="plugins.trello.authenticate"
              defaultMessage="Sign in With Trello"
              description="Sign in with Trello"
            />
          )}
        </label>
        <Button
          disabled={authState === "pending"}
          primary={authState !== "pending"}
          onClick={onAuthenticateClick}
        >
          {authState === "unauthenticated"
            ? "Authenticate"
            : "Authenticating..."}
        </Button>
      </>
    );
  }

  return (
    <>
      <label>
        <FormattedMessage
          id="plugins.trello.boardSelect"
          defaultMessage="Select board"
          description="Select board"
        />
        <div>
          {boardsLoading ? (
            <div className="loading" style={{ marginLeft: "4px" }}>
              Loading... <Spinner size={16} />
            </div>
          ) : (
            <select
              onChange={onBoardSelect}
              defaultValue={
                data.selectedID === null ? boards[0].id : data.selectedID
              }
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
            defaultMessage={"Select lists"}
            description={`Select lists`}
          />
          <div className="list-select-container">
            {listsLoading || boardsLoading ? (
              <div className="loading">
                Loading... <Spinner size={16} />
              </div>
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
        <Button primary onClick={onSignout}>
          Sign Out
        </Button>
      </div>
    </>
  );
};

export default TrelloSettings;
