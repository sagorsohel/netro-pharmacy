import { configureStore } from '@reduxjs/toolkit';
import inventoryReducer from './slices/inventorySlice';
import posReducer from './slices/posSlice';

export const store = configureStore({
  reducer: {
    inventory: inventoryReducer,
    pos: posReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
