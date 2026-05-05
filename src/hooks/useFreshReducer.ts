import { useCallback, useRef } from "react";

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
  const stateRef = useRef(state);
  stateRef.current = state;

  return useCallback(
    (action: A) => save(reducer(stateRef.current, action)),
    [reducer, save],
  );
}
