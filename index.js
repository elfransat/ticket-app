import React from 'react';
import App from './App';
import {store} from '@redux/store';
import {Provider, useDispatch} from 'react-redux';
import {registerRootComponent} from 'expo';

function Index() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

registerRootComponent(Index);
