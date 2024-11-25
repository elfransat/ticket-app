import ticketSlice from './slices/ticketSlice';
import networkSlice from '@redux/slices/networkSlice';
import authSlice from '@redux/slices/authSlice';
import eventSlice from '@redux/slices/eventSlice';
import {configureStore, ThunkAction} from '@reduxjs/toolkit';
import {AnyAction, applyMiddleware} from 'redux';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    network: networkSlice,
    event: eventSlice,
    ticket: ticketSlice,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;
