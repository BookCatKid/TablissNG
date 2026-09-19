import {
  decodeSyncStorage,
  encodeSyncValue,
  syncChunkKeys,
} from "../../../lib/db/storageChunks";
import {
  addTodo,
  clearCompletedTodos,
  removeTodo,
  toggleTodo,
  updateTodo,
} from "./actions";
import { reducer, State } from "./reducer";

describe("todo/reducer", () => {
  it("should add todo", () => {
    expect(reducer([], addTodo("Test todo"))).toEqual([
      {
        id: expect.any(String),
        contents: "Test todo",
        completed: false,
        completedAt: null,
      },
    ]);

    expect(
      reducer(
        [
          {
            id: "1234",
            contents: "Existing todo",
            completed: true,
            completedAt: "2022-30-12T12:44:38",
          },
        ],
        addTodo("Test todo"),
      ),
    ).toEqual([
      {
        id: "1234",
        contents: "Existing todo",
        completed: true,
        completedAt: "2022-30-12T12:44:38",
      },
      {
        id: expect.any(String),
        contents: "Test todo",
        completed: false,
        completedAt: null,
      },
    ]);
  });

  it("should remove todo", () => {
    expect(
      reducer(
        [
          {
            id: "1234",
            contents: "Existing todo",
            completed: true,
            completedAt: "2022-30-12T12:44:38",
          },
        ],
        removeTodo("1234"),
      ),
    ).toEqual([]);

    expect(
      reducer(
        [
          {
            id: "1234",
            contents: "Existing todo",
            completed: true,
            completedAt: "2022-30-12T12:44:38",
          },
          {
            id: "5678",
            contents: "Second existing todo",
            completed: false,
            completedAt: null,
          },
        ],
        removeTodo("1234"),
      ),
    ).toEqual([
      {
        id: "5678",
        contents: "Second existing todo",
        completed: false,
        completedAt: null,
      },
    ]);
  });

  it("should clear completed todos", () => {
    expect(
      reducer(
        [
          {
            id: "1234",
            contents: "Completed todo",
            completed: true,
            completedAt: "2022-30-12T12:44:38",
          },
          {
            id: "5678",
            contents: "Incomplete todo",
            completed: false,
            completedAt: null,
          },
        ],
        clearCompletedTodos(),
      ),
    ).toEqual([
      {
        id: "5678",
        contents: "Incomplete todo",
        completed: false,
        completedAt: null,
      },
    ]);
  });

  it("should clear completed todos from chunked sync storage", () => {
    const storageName = "tabliss/config";
    const completedItems: State = Array.from({ length: 120 }, (_, index) => ({
      id: `completed-${index}`,
      contents: `Completed todo ${index} ${"x".repeat(100)}`,
      completed: true,
      completedAt: "2022-12-30T12:44:38.000Z",
    }));

    for (const activeCount of [2, 70]) {
      const storageKey = `data/todo-widget-${activeCount}`;
      const activeItems: State = Array.from(
        { length: activeCount },
        (_, index) => ({
          id: `active-${index}`,
          contents: `Active todo ${index} ${"y".repeat(100)}`,
          completed: false,
          completedAt: null,
        }),
      );
      const initialData = {
        items: [...completedItems, ...activeItems],
        show: 3,
        dailyRoutine: false,
      };
      const initialWrite = encodeSyncValue(
        storageName,
        storageKey,
        initialData,
      );
      const stored: Record<string, unknown> = { ...initialWrite.updates };

      expect(initialWrite.chunkCount).toBeGreaterThan(1);
      const initialRead = decodeSyncStorage(stored, storageName);
      const loadedData = Object.fromEntries(initialRead.entries)[
        storageKey
      ] as typeof initialData;
      const previousChunks = initialRead.chunkSets.get(storageKey)!;
      const oldChunkKeys = syncChunkKeys(
        storageName,
        storageKey,
        previousChunks,
      );

      const clearedData = {
        ...loadedData,
        items: reducer(loadedData.items, clearCompletedTodos()),
      };
      const replacementWrite = encodeSyncValue(
        storageName,
        storageKey,
        clearedData,
        previousChunks,
      );
      Object.assign(stored, replacementWrite.updates);
      replacementWrite.deletes.forEach((key) => delete stored[key]);

      if (activeCount === 2) {
        expect(replacementWrite.chunkCount).toBe(0);
      } else {
        expect(replacementWrite.chunkCount).toBeGreaterThan(1);
      }
      expect(replacementWrite.deletes).toEqual(oldChunkKeys);
      expect(oldChunkKeys.every((key) => !(key in stored))).toBe(true);
      expect(decodeSyncStorage(stored, storageName).entries).toEqual([
        [storageKey, { ...initialData, items: activeItems }],
      ]);
    }
  });

  it("should toggle todo", () => {
    expect(
      reducer(
        [
          {
            id: "1234",
            contents: "Existing todo",
            completed: true,
            completedAt: "2022-30-12T12:44:38",
          },
          {
            id: "5678",
            contents: "Second existing todo",
            completed: false,
            completedAt: null,
          },
        ],
        toggleTodo("1234"),
      ),
    ).toEqual([
      {
        id: "1234",
        contents: "Existing todo",
        completed: false,
        completedAt: null,
      },
      {
        id: "5678",
        contents: "Second existing todo",
        completed: false,
        completedAt: null,
      },
    ]);

    expect(
      reducer(
        [
          {
            id: "1234",
            contents: "Existing todo",
            completed: true,
            completedAt: "2022-30-12T12:44:38",
          },
          {
            id: "5678",
            contents: "Second existing todo",
            completed: false,
            completedAt: null,
          },
        ],
        toggleTodo("5678"),
      ),
    ).toEqual([
      {
        id: "1234",
        contents: "Existing todo",
        completed: true,
        completedAt: "2022-30-12T12:44:38",
      },
      {
        id: "5678",
        contents: "Second existing todo",
        completed: true,
        completedAt: expect.stringMatching(/[0-9TZ:-]+/),
      },
    ]);
  });

  it("should update todo", () => {
    expect(
      reducer(
        [
          {
            id: "1234",
            contents: "Existing todo",
            completed: true,
            completedAt: "2022-30-12T12:44:38",
          },
          {
            id: "5678",
            contents: "Second existing todo",
            completed: false,
            completedAt: null,
          },
        ],
        updateTodo("1234", "Existing todo: edited"),
      ),
    ).toEqual([
      {
        id: "1234",
        contents: "Existing todo: edited",
        completed: true,
        completedAt: "2022-30-12T12:44:38",
      },
      {
        id: "5678",
        contents: "Second existing todo",
        completed: false,
        completedAt: null,
      },
    ]);
  });

  it("should delete on empty update", () => {
    expect(
      reducer(
        [
          {
            id: "1234",
            contents: "Existing todo",
            completed: true,
            completedAt: "2022-30-12T12:44:38",
          },
          {
            id: "5678",
            contents: "Second existing todo",
            completed: false,
            completedAt: null,
          },
        ],
        updateTodo("5678", ""),
      ),
    ).toEqual([
      {
        id: "1234",
        contents: "Existing todo",
        completed: true,
        completedAt: "2022-30-12T12:44:38",
      },
    ]);
  });

  it("should throw on unknown action", () => {
    expect(() => reducer([], { type: "UNKNOWN" } as any)).toThrow();
  });
});
