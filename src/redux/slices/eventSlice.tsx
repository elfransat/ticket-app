import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import eventService from '@services/event.service';
import storageService from '@services/storage.service';
import {useDispatch} from 'react-redux';

export interface events {
  events: Array<any>;
  filteredEvents: Array<any>;
  date: number;
}

const initialState: events = {
  events: [],
  date: 0,
  filteredEvents: [],
};

export const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    setEventsState: (state, action) => {
      state.events = action.payload;
      state.filteredEvents = action.payload;
    },
    setFilteredEventsState: (state, action) => {
      state.filteredEvents = action.payload;
    },
  },
});

export const retrieveEvents = createAsyncThunk(
  'events/retrieve',
  async (_, thunkAPI) => {
    const user = await thunkAPI.getState().auth.user; // allows us to destructure to use in event service
    const connected = await thunkAPI.getState().network.isConnected; // allows us to destructure to use in event service
    const currentRole = await thunkAPI.getState().auth.currentRole;
    try {
      let events = [];
      if (connected) {
        // if user has network connection search for the events online
        eventService
          .fetchEvents(user.uid, currentRole)
          .then(async response => {
            events = response.data;
            events = eventService.sortEvents(events); //asign events to return value of sort events function
            await storageService.storeEvents(events, currentRole);
            await thunkAPI.dispatch(setEventsState(events));
          })
          .catch(function (error) {
            console.log(error);
          });
      } else {
        events = await storageService.retrieveEvents(currentRole);
        await thunkAPI.dispatch(setEventsState(events));
      }
    } catch (error) {
      return error;
    }
  },
);

export const sortEvents = createAsyncThunk(
  'events/retrieve',
  async (text: string, thunkAPI) => {
    const events = thunkAPI.getState().event.events;
    if (text) {
      const newData = events.filter(function (event) {
        const eventData = event.name
          ? event.name.toUpperCase()
          : ''.toUpperCase();
        const textData = text.toUpperCase();
        return eventData.indexOf(textData) > -1;
      });
      thunkAPI.dispatch(setFilteredEventsState(newData));
    } else {
      // Inserted text is blank
      // Update FilteredDataSource with masterDataSource
      thunkAPI.dispatch(setFilteredEventsState(events));
    }
  },
);

// Action creators are generated for each case reducer function
export const {setEventsState, setFilteredEventsState} = eventSlice.actions;

export default eventSlice.reducer;
