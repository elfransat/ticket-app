import React from 'react';
import {ImageBackground, StyleSheet, KeyboardAvoidingView} from 'react-native';
import {theme} from '@config/theme';
import {getStatusBarHeight} from 'react-native-status-bar-height';

export default function Background({children}) {
  return (
    <ImageBackground resizeMode="repeat" style={styles.background}>
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        {children}
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    backgroundColor: theme.colors.background,
    display: 'flex',
  },
  container: {
    flex: 1,
    padding: 10,
    width: '100%',
    height: '100%',
    maxWidth: 340,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'flex-start',
    top: 5 + getStatusBarHeight(),
  },
});
