import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import authService from '@services/auth.service';
import storageService from '@services/storage.service';
import * as SecureStore from 'expo-secure-store';
import {useSelector} from 'react-redux';
import {store, RootState, AppDispatch} from '@redux/store';
import {networkSlice} from './networkSlice';

export interface credentials {
  mail: string;
  pass: string;
}

export interface authState {
  authorized: boolean;
  user: any;
  errorCode: null | string;
  canScan: boolean;
  currentRole: string;
}

const initialState: authState = {
  authorized: false,
  user: null,
  errorCode: null,
  canScan: false,
  currentRole: 'fan',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserState: (state, action) => {
      state.user = action.payload;
    },
    logoutUser: state => {
      state.authorized = false;
      state.user = null;
      storageService.secureDeleteUser();
    },
    storeUserState: (state, action) => {
      state.user = action.payload;
    },
    successfulLogin: state => {
      state.authorized = true;
    },
    setErrorCode: (state, action) => {
      state.errorCode = action.payload;
    },
    canScan: (state, action) => {
      const roles = action.payload.roles;
      const validRoles = ['venue', 'act', 'campaigner', 'promoter', 'editor'];
      const canScan = roles.some(r => validRoles.includes(r));
      if (canScan) {
        state.canScan = true;
      } else {
        state.canScan = false;
      }
      console.log(state.canScan);
    },
    setCurrentRoleScanner: state => {
      state.currentRole = 'scanner';
    },
    setCurrentRoleFan: state => {
      state.currentRole = 'fan';
    },
  },
});

export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: credentials, thunkAPI) => {
    await authService
      .login(credentials.mail, credentials.pass)
      .then(async response => {
        // handles setting user, login and storing of the secureStore token
        await thunkAPI.dispatch(setUserState(response.data.current_user));
        await storageService.secureStoreCredentials(credentials);
        await storageService.secureStoreUser(response.data.current_user);
        await thunkAPI.dispatch(successfulLogin());
        await thunkAPI.dispatch(canScan(response.data.current_user));
      })
      .catch(error => {
        console.log(error);
        thunkAPI.dispatch(setErrorCode(error.response.data.message));
      });
  },
);

export const retrieveUser = createAsyncThunk(
  'user/retrieve',
  async (_, thunkAPI) => {
    const connected = await thunkAPI.getState().network.isConnected; //TODO works correctly but fix Type error
    const userCredentials = await storageService.secureRetrieveCredentials();
    try {
      if (connected && userCredentials) {
        await thunkAPI.dispatch(loginUser(userCredentials));
      } else if (!connected && userCredentials) {
        const user = await storageService.secureRetrieveUser();
        await thunkAPI.dispatch(setUserState(user));
        await thunkAPI.dispatch(successfulLogin());
        await thunkAPI.dispatch(canScan(user));
      }
    } catch (error) {
      return error;
    }
  },
);

// Action creators are generated for each case reducer function
export const {
  logoutUser,
  successfulLogin,
  setUserState,
  setErrorCode,
  canScan,
  setCurrentRoleFan,
  setCurrentRoleScanner,
} = authSlice.actions;

export default authSlice.reducer;
