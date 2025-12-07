import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type MapState = {
  isEditing: boolean;
};

type MapActions = {
  startEditing: () => void;
  finishEditing: () => void;
};

export const useMapStore = create<MapState & MapActions>()(
  immer((set) => ({
    isEditing: false,

    startEditing: () =>
      set((state) => {
        state.isEditing = true;
      }),

    finishEditing: () =>
      set((state) => {
        state.isEditing = false;
      }),
  }))
);
