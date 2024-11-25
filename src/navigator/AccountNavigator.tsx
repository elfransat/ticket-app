import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {LoginScreen, RegisterScreen, ResetPasswordScreen} from '@screens/index';

const Stack = createStackNavigator();

export const AccountNavigator = () => (
  <Stack.Navigator headerMode="none">
    <Stack.Screen name="LoginScreen" component={LoginScreen} />
    <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
    <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
  </Stack.Navigator>
);
