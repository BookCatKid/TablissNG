import { useCallback } from "react";

/**
 * Created in response to the problems with useSavedReducer.
 * useSavedReducer takes in an initial state and saves it. If used multiple times across components,
 * this results in stale closures / drift due to the reducers operating on potentially different data.
 * The solution to this is simple - don't store an initial state and always use the freshest state when
 * dispatching actions.
 *
 * @param reducer
 * @param state
 * @param save
 * @returns
 */
export function useFreshReducer<S, A>(
  reducer: (state: S, action: A) => S,
  state: S,
  save: (state: S) => void,
) {
  return useCallback(
    (action: A) => save(reducer(state, action)),
    [reducer, state, save],
  );
}
