import { Action } from "./actions";

type Todo = {
  id: string;
  contents: string;
  completed: boolean;
  completedAt: string | null;
};

export type State = Todo[];

export function reducer(state: State, action: Action) {
  switch (action.type) {
    case "ADD_TODO":
      return state.concat(action.data);

    case "REMOVE_TODO":
      return state.filter((todo) => todo.id !== action.data.id);

    case "TOGGLE_TODO":
      return state.map((todo) =>
        todo.id === action.data.id
          ? {
              ...todo,
              completed: !todo.completed,
              completedAt: todo.completed ? null : new Date().toISOString(),
            }
          : todo,
      );

    case "UPDATE_TODO":
      if (action.data.contents === "") {
        return state.filter((todo) => todo.id !== action.data.id);
      }

      return state.map((todo) =>
        todo.id === action.data.id
          ? { ...todo, contents: action.data.contents }
          : todo,
      );

    case "REORDER_TODO": {
      const { index, to } = action.data;
      if (index < 0 || index >= state.length || to < 0 || to >= state.length) {
        return state;
      }
      const todos = [...state];
      todos.splice(to, 0, todos.splice(index, 1)[0]);
      return todos;
    }

    default:
      throw new Error("Unknown action");
  }
}
