import React, { ChangeEvent, FC } from "react";
import {
  BoardPreference,
  defaultCache,
  defaultData,
  Props,
  TrelloSession,
} from "./types";
import { cacheReducer } from "./cacheReducer";
import { useFreshReducer } from "../../../hooks/useFreshReducer";
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
  const dispatchUI = useFreshReducer(cacheReducer, cache, setCache);
  const {
    lists,
    setLists,
    isLoading: listsLoading,
  } = useLists(data, dispatchUI);

  const onAuthenticateClick = async () => {
    await signIn(trelloAuthFlow);
  };

  const onSignout = async () => {
    await signOut(onTrelloSignOut);
    dispatchUI({ type: "CLEAR" });
  };

  const onBoardSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    setData({ ...data, selectedID: event.target.value });
    dispatchUI({ type: "CLEAR" });
  };

  const onListCheckboxSelect = (listID: string) => {
    const targetList = lists.find((list: List) => list.id === listID);
    if (!targetList) {
      return;
    }

    // Toggle the selected status for the checked list
    const updatedSettingsOptions = lists.map((list: List) => {
      return list.id === listID ? { ...list, selected: !list.selected } : list;
    });
    setLists(updatedSettingsOptions);

    // Call to data reducer

    // Update preferences
    const selectedLists = updatedSettingsOptions.filter(
      (list: List) => list.selected,
    );
    const newPreference: BoardPreference = {
      boardId: data.selectedID!,
      lists: selectedLists,
    };

    const updated = {
      ...data.preferences,
      [data.selectedID!]: newPreference,
    };

    dispatchUI({ type: "TOGGLE", order: selectedLists, target: targetList });
    setData({ ...data, preferences: updated });
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
                    checked={list.selected}
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
