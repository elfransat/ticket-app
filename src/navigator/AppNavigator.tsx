import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {EventsScreen, TicketsScreen, ScannerScreen} from '@screens/index';

const Stack = createStackNavigator();

export const AppNavigator = () => (
  <Stack.Navigator headerMode="none">
    <Stack.Screen name="EventsScreen" component={EventsScreen} />
    <Stack.Screen name="TicketsScreen" component={TicketsScreen} />
    <Stack.Screen name="ScannerScreen" component={ScannerScreen} />
  </Stack.Navigator>
);
