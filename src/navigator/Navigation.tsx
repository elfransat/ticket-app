import React, {useContext, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AccountNavigator} from './AccountNavigator';
import {AppNavigator} from './AppNavigator';
import * as SplashScreen from 'expo-splash-screen';
import {useSelector} from 'react-redux';
import {RootState} from '@redux/store';
import {retrieveUser} from '@redux/slices/authSlice';
import {useAppDispatch} from '@redux/hooks';

export const Navigation = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.authorized,
  );

  const useDispatch = useAppDispatch();

  const [appIsReady, setAppIsReady] = useState<boolean>(false);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await useDispatch(retrieveUser());
        // Artificially delay for two seconds to simulate a slow loading
        // await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  return (
    <NavigationContainer>
      {isAuthenticated == true ? <AppNavigator /> : <AccountNavigator />}
    </NavigationContainer>
  );
};
