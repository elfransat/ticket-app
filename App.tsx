import React from 'react';
import {Navigation} from './src/navigator/Navigation';
import NetInfo from '@react-native-community/netinfo';
import {
  onConnection,
  onConnectionLost,
  connected,
  initializeConnectionLost,
} from '@redux/slices/networkSlice';

import {useAppDispatch} from '@redux/hooks';

export default function App() {
  const dispatch = useAppDispatch();
  // network subscriber that will update network status upon changes via redux slices
  const networkMonitoring = NetInfo.addEventListener(state => {
    // console.log('Connection type', state.type);
    if (state.isConnected && state.isInternetReachable) {
      dispatch(onConnection());
      console.log('offline');
      // console.log('internet working...');
    } else if (!state.isConnected) {
      // console.log('Internet is not reachable');
      dispatch(initializeConnectionLost());
      console.log('online');
    }
  });

  return <Navigation />;
}
