import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import ticketService from '@services/ticket.service';
import storageService from '@services/storage.service';

export interface tickets {
  currentTickets: Array<any>; //todo change to usertickets
  date: number;
  scannedTicket: {
    isValid: boolean;
    eventName: string;
    code: string;
    eventID: string;
    redeemed: boolean;
    loading: boolean;
    ticketDetails: any;
    scanned: boolean;
    type: string;
    seat: null | string;
  };
}

const initialState: tickets = {
  currentTickets: [],
  date: 0,
  scannedTicket: {
    scanned: false,
    isValid: false,
    eventName: '',
    code: '',
    eventID: '',
    redeemed: false,
    loading: false,
    ticketDetails: {},
    type: '',
    seat: null,
  },
};

export const ticketSlice = createSlice({
  name: 'ticket',
  initialState,
  reducers: {
    setCurrentTicketsState: (state, action) => {
      state.currentTickets = action.payload;
    },
    ticketScanned: (state, action) => {
      console.log(action.payload.code);
      const ticket = state.scannedTicket;
      ticket.code = action.payload.code;
      ticket.eventID = action.payload.eventID;
      ticket.eventName = action.payload.eventName;
      ticket.type = action.payload.type;
      ticket.seat = action.payload.seat;
      ticket.loading = true;
      ticket.scanned = true;
      // state.scannedTicket = ticket;
    },

    validTicket: state => {
      const ticket = state.scannedTicket;
      ticket.isValid = true;
      ticket.redeemed = false;
      ticket.loading = false;
      state.scannedTicket = ticket;
    },
    redeemedTicket: state => {
      const ticket = state.scannedTicket;
      ticket.isValid = true;
      ticket.redeemed = true;
      ticket.loading = false;
      state.scannedTicket = ticket;
    },
    invalidTicket: state => {
      const ticket = state.scannedTicket;
      ticket.isValid = false;
      ticket.redeemed = false;
      ticket.loading = false;
      state.scannedTicket = ticket;
    },
    clearTicket: state => {
      const ticket = state.scannedTicket;
      ticket.isValid = false;
      ticket.scanned = false;
      ticket.redeemed = false;
      ticket.loading = false;
      ticket.code = '';
      ticket.eventID = '';
      ticket.eventName = '';
      ticket.type = '';
    },

    checkValidity: (state, action) => {
      const used = action.payload || null;
      const ticket = state.scannedTicket;
      if (used === '0') {
        console.log('not used yet');
        ticket.isValid = true;
        ticket.redeemed = false;
        state.scannedTicket = ticket;
        ticket.loading = false;
      } else if (used === '1') {
        console.log('already used');
        ticket.isValid = true;
        ticket.redeemed = true;
        ticket.loading = false;
        state.scannedTicket = ticket;
      } else {
        console.log('invalid ticket');
        ticket.isValid = false;
        ticket.redeemed = false;
        state.scannedTicket = ticket;
        ticket.loading = false;
      }
    },

    setScanned: state => {
      const ticket = state.scannedTicket;
      ticket.scanned = true;
      state.scannedTicket = ticket;
      // console.log(state);
      // ticket.scanned = true;
      // console.log(ticket);
      // state.scannedTicket.scanned = true;
    },
    setNotScanned: state => {
      // state.scannedTicket.scanned = true;
    },
  },
});

export const retrieveTickets = createAsyncThunk(
  'tickets/retrieve',
  async (eventID: string, thunkAPI) => {
    const user = await thunkAPI.getState().auth.user; // allows us to destructure to use in ticket service
    const connected = await thunkAPI.getState().network.isConnected; // allows us to destructure to use in ticket service
    const auth = await thunkAPI.getState().auth;

    try {
      let tickets = [];
      if (connected) {
        // if user has network connection search for the tickets online
        ticketService
          .retrieveTickets(eventID, user.uid)
          .then(async response => {
            tickets = response.data;
            await storageService.storeUserTickets(tickets);
            await thunkAPI.dispatch(setCurrentTicketsState(tickets));
          })
          .catch(function (error) {
            console.log(error);
          });
      } else {
        tickets = await storageService.retrieveTickets(
          eventID,
          auth.currentRole,
        );
        await thunkAPI.dispatch(setCurrentTicketsState(tickets));
      }
    } catch (error) {
      return error;
    }
  },
);

export const retrieveAllTickets = createAsyncThunk(
  'tickets/retrieve',
  async (_, thunkAPI) => {
    const user = await thunkAPI.getState().auth.user; // allows us to destructure to use in ticket service
    const connected = await thunkAPI.getState().network.isConnected; // allows us to destructure to use in ticket service
    const auth = await thunkAPI.getState().auth;
    try {
      let tickets = [];
      if (connected) {
        // if user has network connection search for the tickets online
        ticketService
          .retrieveAllTickets(user.uid)
          .then(async response => {
            tickets = response.data;
            await storageService.storeUserTickets(tickets);
          })
          .catch(function (error) {
            console.log(error.response);
          });
        if (auth.canScan) {
          ticketService
            .retrieveManagedTickets(user.uid)
            .then(async response => {
              // console.log(response.data);
              tickets = response.data;
              await storageService.storeManagedTickets(response.data);
            })
            .catch(function (error) {
              console.log(error.response);
            });
        }
      }
    } catch (error) {
      return error;
    }
  },
);

export const validateTicket = createAsyncThunk(
  'tickets/validate',
  async (ticket: any, thunkAPI) => {
    const connected = await thunkAPI.getState().network.isConnected;
    await thunkAPI.dispatch(ticketScanned(ticket));
    // await thunkAPI.dispatch(setScanned());
    console.log('validating..' + JSON.stringify(ticket));
    try {
      if (connected) {
        // if user has network connection try to validate the ticket online
        await ticketService
          .validateTicket(ticket)
          .then(async response => {
            const used = response.data.used;
            await thunkAPI.dispatch(checkValidity(used));
          })
          .catch(function (error) {});
      } else {
        const userTicket = await storageService.validateTicket(
          ticket.code,
          ticket.eventID,
        );
        if (userTicket) {
          await thunkAPI.dispatch(checkValidity(userTicket.used));
        } else {
          await thunkAPI.dispatch(checkValidity(null));
        }
      }
    } catch (error) {
      return error;
    }
  },
);

export const validateTicketShort = createAsyncThunk(
  'tickets/validate',
  async (ticket: any, thunkAPI) => {
    const connected = await thunkAPI.getState().network.isConnected;
    // await thunkAPI.dispatch(ticketScanned(ticket));
    try {
      if (connected) {
        // if user has network connection try to validate the ticket online
        await ticketService
          .validateTicketShort(ticket)
          .then(async response => {
            // console.log(response.data);
            const used = response.data.used;
            await thunkAPI.dispatch(ticketScanned(response.data));
            await thunkAPI.dispatch(checkValidity(used));
          })
          .catch(function (error) {});
      } else {
        const userTicket = await storageService.validateTicketShort(
          ticket.code,
          ticket.eventID,
        );
        if (userTicket) {
          console.log(userTicket);

          await thunkAPI.dispatch(ticketScanned(userTicket));
          await thunkAPI.dispatch(checkValidity(userTicket.used));
        } else {
          await thunkAPI.dispatch(checkValidity(null));
        }
      }
    } catch (error) {
      return error;
    }
  },
);

export const redeemTicket = createAsyncThunk(
  'tickets/redeem',
  async (eventID: any, thunkAPI) => {
    const connected = await thunkAPI.getState().network.isConnected;
    const ticket = await thunkAPI.getState().ticket.scannedTicket;

    console.log(ticket);
    try {
      if (connected) {
        // if user has network connection try to validate the ticket online
        await ticketService
          .redeemTicket(ticket, eventID)
          .then(async response => {
            await thunkAPI.dispatch(clearTicket());
          })
          .catch(function (error) {
            console.log(error);
          });
      }
      await storageService.redeemTicket(ticket.code, eventID);
      await thunkAPI.dispatch(clearTicket());
    } catch (error) {
      return error;
    }
    await thunkAPI.dispatch(setNotScanned());
  },
);

export const redeemTicketsRetrievedSinceConnectionLost = createAsyncThunk(
  'tickets/redeem',
  async (_, thunkAPI) => {
    try {
      const tickets = await storageService
        .retrieveTicketsRedeemedSinceNetworkLost()
        .then(async response => {});

      console.log(tickets);
    } catch (error) {
      return error;
    }
    // await storageService.setOnConnectionLost();
  },
);

// Action creators are generated for each case reducer function
export const {
  setCurrentTicketsState,
  validTicket,
  ticketScanned,
  redeemedTicket,
  invalidTicket,
  clearTicket,
  checkValidity,
  setScanned,
  setNotScanned,
} = ticketSlice.actions;

export default ticketSlice.reducer;
