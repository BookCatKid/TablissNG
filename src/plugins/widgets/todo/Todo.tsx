import { FC, useEffect } from "react";
import { defineMessages, useIntl } from "react-intl";

import {
  useKeyPress,
  useSavedReducer,
  useTime,
  useToggle,
} from "../../../hooks";
import {
  DownIcon,
  ExpandIcon,
  Icon,
  RemoveIcon,
  UpIcon,
} from "../../../views/shared";
import {
  addTodo,
  clearCompletedTodos,
  removeTodo,
  reorderTodo,
  toggleTodo,
  updateTodo,
} from "./actions";
import { reducer, State } from "./reducer";
import TodoList from "./TodoList";
import { defaultData, Props } from "./types";

const messages = defineMessages({
  clearCompleted: {
    id: "plugins.todo.clearCompleted",
    defaultMessage: "Clear completed todos",
    description: "Button title for removing all completed todos",
  },
  clearCompletedConfirm: {
    id: "plugins.todo.clearCompletedConfirm",
    defaultMessage:
      "Are you sure you want to delete all completed todos? This cannot be undone.",
    description: "Confirmation message when clearing completed todos",
  },
});

const Todo: FC<Props> = ({ data = defaultData, setData }) => {
  const intl = useIntl();
  const [showCompleted, toggleShowCompleted] = useToggle();
  const [showMore, toggleShowMore] = useToggle();
  const time = useTime();

  const setItems = (items: State) => setData({ ...data, items });
  const dispatch = useSavedReducer(reducer, data.items, setItems);

  const items = data.items.filter((item) => !item.completed || showCompleted);
  const hasCompleted = data.items.some((item) => item.completed);
  const show = !showMore ? data.show : undefined;

  const keyBind = data.keyBind ?? "T";
  useKeyPress(
    (event: KeyboardEvent) => {
      event.preventDefault();
      dispatch(addTodo());
    },
    [keyBind.toUpperCase(), keyBind.toLowerCase()],
  );

  useEffect(() => {
    if (data.dailyRoutine) {
      const today = new Date(time);
      today.setHours(0, 0, 0, 0);
      for (const item of data.items) {
        if (item.completed && item.completedAt) {
          if (new Date(item.completedAt).getTime() < today.getTime()) {
            dispatch(toggleTodo(item.id));
          }
        }
      }
    }
  }, [data.items, data.dailyRoutine, time]);

  return (
    <div className="Todo">
      <TodoList
        items={items}
        allItems={data.items}
        onToggle={(...args) => dispatch(toggleTodo(...args))}
        onUpdate={(...args) => dispatch(updateTodo(...args))}
        onRemove={(...args) => dispatch(removeTodo(...args))}
        onReorder={(...args) => dispatch(reorderTodo(...args))}
        show={show}
      />

      <div>
        <a onClick={() => dispatch(addTodo())}>
          <ExpandIcon />
        </a>{" "}
        <a onClick={toggleShowCompleted}>
          <Icon name={showCompleted ? "check-circle" : "circle"} />
        </a>{" "}
        {showCompleted && hasCompleted && (
          <>
            <a
              onClick={() => {
                if (
                  confirm(intl.formatMessage(messages.clearCompletedConfirm))
                ) {
                  dispatch(clearCompletedTodos());
                }
              }}
              title={intl.formatMessage(messages.clearCompleted)}
            >
              <RemoveIcon />
            </a>{" "}
          </>
        )}
        {items.length > data.show && (
          <a onClick={toggleShowMore}>{showMore ? <UpIcon /> : <DownIcon />}</a>
        )}
      </div>
    </div>
  );
};

export default Todo;
