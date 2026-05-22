import { ChangeEvent, FC } from "react";
import { FormattedMessage } from "react-intl";

import useAuth from "../../../hooks/useAuth";
import { useFreshReducer } from "../../../hooks/useFreshReducer";
import { commonMessages } from "../../../locales/messages";
import Button from "../../../views/shared/Button";
import { Spinner } from "../../shared";
import useBoards from "./hooks/useBoards";
import useLists from "./hooks/useLists";
import { cacheReducer } from "./reducers";
import { dataReducer } from "./reducers";
import { trelloAuthStore } from "./stores/trelloAuthStore";
import { defaultCache, defaultData, Props, TrelloSession } from "./types";
import { Board } from "./types";
import { ListCheckbox } from "./ui/ListCheckbox";
import { onTrelloSignOut, trelloAuthFlow } from "./utils/auth";

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

  const dispatchData = useFreshReducer(dataReducer, data, setData);
  const { boards, isLoading: boardsLoading } = useBoards(data, dispatchData);
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
    dispatchData({ type: "SET_SELECTED_BOARD", boardId: event.target.value });
    dispatchUI({ type: "CLEAR" });
  };

  const onListCheckboxSelect = (listID: string) => {
    const targetList = lists.find((l) => l.id === listID);
    if (!targetList) {
      return;
    }

    // Toggle the selected status for the checked list
    const updatedSettingsOptions = lists.map((l) => {
      return l.id === listID ? { ...l, selected: !l.selected } : l;
    });
    setLists(updatedSettingsOptions);

    // Update preferences
    const selectedLists = updatedSettingsOptions.filter((l) => l.selected);
    const order = selectedLists.map((l) => l.id);

    dispatchData({
      type: "ADD_PREFERENCE",
      boardId: data.selectedID!,
      lists: selectedLists,
    });
    dispatchUI({
      type: "TOGGLE_LIST_VISIBILITY",
      order: order,
      target: targetList,
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
          {authState === "unauthenticated" ? (
            <FormattedMessage
              id="plugins.trello.authenticate.button"
              defaultMessage="Authenticate"
              description="Button text to start Trello authentication"
            />
          ) : (
            <FormattedMessage
              id="plugins.trello.authenticating"
              defaultMessage="Authenticating..."
              description="Status message while Trello authentication is in progress"
            />
          )}
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
              <FormattedMessage {...commonMessages.loading} />{" "}
              <Spinner size={16} />
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
            defaultMessage="Select lists"
            description="Select lists"
          />
          <div className="list-select-container">
            {listsLoading || boardsLoading ? (
              <div className="loading">
                <FormattedMessage {...commonMessages.loading} />{" "}
                <Spinner size={16} />
              </div>
            ) : (
              lists.map((list, index) => {
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
          <FormattedMessage
            id="plugins.trello.signout"
            defaultMessage="Sign Out"
            description="Button text to sign out of Trello"
          />
        </Button>
      </div>
    </>
  );
};

export default TrelloSettings;
