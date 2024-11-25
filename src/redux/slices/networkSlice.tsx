import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import storageService from '@services/storage.service';
import ticketService from '@services/ticket.service';

export interface network {
  isConnected: boolean;
  timeConnectionlost: string | null;
}

const initialState: network = {
  isConnected: true, //CHANGE
  timeConnectionlost: null,
};

export const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    connected: state => {
      state.isConnected = true;
      // console.log(state.timeConnectionlost);
    },
    onConnectionLost: (state, action) => {
      state.isConnected = false;
      state.timeConnectionlost = action.payload.timeConnectionLost;
      console.log(state.timeConnectionlost);
    },
  },
});

export const onConnection = createAsyncThunk(
  'network/...',
  async (_, thunkAPI) => {
    try {
      // if the time connection lost is set then send tickets to API
      const tickets =
        await storageService.retrieveTicketsRedeemedSinceNetworkLost();
      console.log('tickets? ' + tickets);
      /// then send tickets to the API endpoint and afterwards clear timeConnectionLost

      // include .then to call storageService.deleteOnConnectionLost()
    } catch (error) {
      return error;
    }
    await thunkAPI.dispatch(connected);
  },
);

export const initializeConnectionLost = createAsyncThunk(
  'network/initializeConnectionLost',
  async (_, thunkAPI) => {
    const timeConnectionLost = await storageService.retrieveOnConnectionLost();
    console.log('time connection lost ' + timeConnectionLost);
    try {
      // await thunkAPI.dispatch(onConnectionLost(timeConnectionLost));
    } catch (error) {
      return error;
    }
  },
);

// Action creators are generated for each case reducer function
export const {onConnectionLost, connected} = networkSlice.actions;

export default networkSlice.reducer;
